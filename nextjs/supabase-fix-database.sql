-- =====================================================
-- سكريبت فحص وإكمال قاعدة البيانات
-- EliteDrops E-Commerce Platform
-- =====================================================
-- انسخ هذا الملف بالكامل ونفذه في Supabase SQL Editor
-- =====================================================

-- =====================================================
-- الجزء الأول: فحص الجداول الموجودة
-- =====================================================

-- عرض الجداول الموجودة
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =====================================================
-- الجزء الثاني: إنشاء الجداول الناقصة
-- =====================================================

-- ١. جدول إعدادات المنصات (Platform Settings)
CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ٢. جدول قوالب الإشعارات (Notification Templates)
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'both')),
    trigger_event TEXT NOT NULL CHECK (trigger_event IN (
        'manual',
        'order_placed',
        'order_confirmed',
        'order_processing',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'payment_received',
        'payment_failed',
        'tracking_added',
        'return_requested',
        'refund_processed'
    )),
    subject TEXT,
    body_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ٣. جدول سجلات المراسلات (Communication Logs)
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
    direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'pending')),
    provider_message_id TEXT,
    subject TEXT,
    content_snapshot TEXT NOT NULL,
    recipient TEXT NOT NULL,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ٤. جدول تتبع الطلبات (Order Tracking)
CREATE TABLE IF NOT EXISTS order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    carrier_name TEXT NOT NULL,
    tracking_number TEXT NOT NULL,
    tracking_url TEXT,
    estimated_delivery DATE,
    shipped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, tracking_number)
);

-- ٥. جدول الرسائل السريعة (Quick Messages)
CREATE TABLE IF NOT EXISTS quick_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
    category TEXT,
    icon TEXT,
    color TEXT,
    is_pinned BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- الجزء الثالث: إضافة الأعمدة الناقصة لجدول المنتجات
-- =====================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS appscenic_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS zendrop_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- الجزء الرابع: إنشاء الفهارس
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_communication_logs_order ON communication_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_customer ON communication_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_tracking ON order_tracking(tracking_number);
CREATE INDEX IF NOT EXISTS idx_notification_templates_event ON notification_templates(trigger_event, is_active);
CREATE INDEX IF NOT EXISTS idx_products_appscenic_id ON products(appscenic_id);
CREATE INDEX IF NOT EXISTS idx_products_zendrop_id ON products(zendrop_id);
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);

-- =====================================================
-- الجزء الخامس: إنشاء الدوال والتريغرز
-- =====================================================

-- دالة تحديث وقت التعديل
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء التريغرز للتحديث التلقائي
DROP TRIGGER IF EXISTS update_notification_templates_updated ON notification_templates;
CREATE TRIGGER update_notification_templates_updated
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_communication_logs_updated ON communication_logs;
CREATE TRIGGER update_communication_logs_updated
    BEFORE UPDATE ON communication_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_tracking_updated ON order_tracking;
CREATE TRIGGER update_order_tracking_updated
    BEFORE UPDATE ON order_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_settings_updated ON platform_settings;
CREATE TRIGGER update_platform_settings_updated
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة استبدال المتغيرات في القوالب
CREATE OR REPLACE FUNCTION replace_template_variables(
    template TEXT,
    variables JSONB
) RETURNS TEXT AS $$
DECLARE
    result TEXT := template;
    key TEXT;
    value TEXT;
BEGIN
    FOR key, value IN SELECT * FROM jsonb_each_text(variables) LOOP
        result := replace(result, '{{' || key || '}}', COALESCE(value, ''));
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- الجزء السادس: إدخال البيانات الافتراضية
-- =====================================================

-- إعدادات المنصة الافتراضية
INSERT INTO platform_settings (id, config)
VALUES (
    'default',
    '{
        "platform": "local",
        "local": { "enabled": true },
        "zendrop": { "enabled": false },
        "appscenic": { "enabled": false }
    }'
) ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config;

-- إدخال قوالب افتراضية (إذا لم تكن موجودة)
INSERT INTO notification_templates (name, description, channel, trigger_event, subject, body_content, is_active)
SELECT 
    'تأكيد الطلب',
    'إشعار عند تأكيد استلام الطلب',
    'email',
    'order_confirmed',
    'تم تأكيد طلبك #{{order_id}}',
    'مرحباً {{customer_first_name}}،

شكراً لطلبك! لقد استلمنا طلبك رقم {{order_id}} ونعمل على تحضيره الآن.

تفاصيل الطلب:
- رقم الطلب: {{order_id}}
- الإجمالي: {{order_total}}

سنرسل لك تحديثاً فور شحن الطلب.

مع خالص التحية،
فريق {{store_name}}',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM notification_templates 
    WHERE name = 'تأكيد الطلب' AND trigger_event = 'order_confirmed'
);

INSERT INTO notification_templates (name, description, channel, trigger_event, subject, body_content, is_active)
SELECT 
    'شحن الطلب',
    'إشعار عند شحن الطلب مع رابط التتبع',
    'email',
    'order_shipped',
    'تم شحن طلبك #{{order_id}}',
    'مرحباً {{customer_first_name}}،

ممتاز! تم شحن طلبك رقم {{order_id}}.

معلومات الشحن:
- شركة الشحن: {{carrier_name}}
- رقم التتبع: {{tracking_number}}

رابط التتبع: {{tracking_url}}

يمكنك استخدام هذا الرابط لمتابعة شحنتك.

مع خالص التحية،
فريق {{store_name}}',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM notification_templates 
    WHERE name = 'شحن الطلب' AND trigger_event = 'order_shipped'
);

INSERT INTO notification_templates (name, description, channel, trigger_event, subject, body_content, is_active)
SELECT 
    'إشعار التتبع',
    'إشعار تلقائي عند إضافة رقم تتبع',
    'email',
    'tracking_added',
    'رابط تتبع طلبك #{{order_id}}',
    'مرحباً {{customer_first_name}}،

تم إضافة معلومات التتبع لطلبك رقم {{order_id}}.

شركة الشحن: {{carrier_name}}
رقم التتبع: {{tracking_number}}

رابط التتبع: {{tracking_url}}

التسليم المتوقع: {{estimated_delivery}}

مع خالص التحية،
فريق {{store_name}}',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM notification_templates 
    WHERE name = 'إشعار التتبع' AND trigger_event = 'tracking_added'
);

INSERT INTO notification_templates (name, description, channel, trigger_event, subject, body_content, is_active)
SELECT 
    'تم التسليم',
    'إشعار عند تسليم الطلب للعميل',
    'email',
    'order_delivered',
    'تم تسليم طلبك #{{order_id}}',
    'مرحباً {{customer_first_name}}،

يسعدنا إبلاغك بأن طلبك رقم {{order_id}} قد تم تسليمه بنجاح!

نأمل أن تكون راضياً عن مشترياتك. لا تتردد في ترك تقييم للمنتجات التي اشتريتها.

إذا كان لديك أي استفسارات، نحن هنا لمساعدتك.

مع خالص التحية،
فريق {{store_name}}',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM notification_templates 
    WHERE name = 'تم التسليم' AND trigger_event = 'order_delivered'
);

-- إدخال رسائل سريعة افتراضية
INSERT INTO quick_messages (title, content, channel, category, icon, color, is_pinned)
SELECT 'شكراً للطلب', 'شكراً لطلبك! نقدر اختيارك لنا ونعمل على تحضيره الآن.', 'email', 'شكر', '🎁', '#10B981', true
WHERE NOT EXISTS (SELECT 1 FROM quick_messages WHERE title = 'شكراً للطلب');

INSERT INTO quick_messages (title, content, channel, category, icon, color, is_pinned)
SELECT 'تأكيد الشحن', 'تم شحن طلبك اليوم وسيصلك خلال 3-5 أيام عمل.', 'sms', 'شحن', '📦', '#3B82F6', false
WHERE NOT EXISTS (SELECT 1 FROM quick_messages WHERE title = 'تأكيد الشحن');

INSERT INTO quick_messages (title, content, channel, category, icon, color, is_pinned)
SELECT 'طلب جاهز للاستلام', 'طلبك جاهز للاستلام من نقطة الاستلام.', 'sms', 'استلام', '🏪', '#8B5CF6', false
WHERE NOT EXISTS (SELECT 1 FROM quick_messages WHERE title = 'طلب جاهز للاستلام');

-- =====================================================
-- الجزء السابع: التحقق من النتائج
-- =====================================================

-- عرض الجداول التي تم إنشاؤها
SELECT 'الجداول المنشأة:' as message;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'platform_settings',
    'notification_templates',
    'communication_logs',
    'order_tracking',
    'quick_messages'
)
ORDER BY table_name;

-- عرض عدد السجلات في كل جدول
SELECT 
    'platform_settings' as table_name,
    COUNT(*) as count
FROM platform_settings
UNION ALL
SELECT 
    'notification_templates',
    COUNT(*)
FROM notification_templates
UNION ALL
SELECT 
    'communication_logs',
    COUNT(*)
FROM communication_logs
UNION ALL
SELECT 
    'order_tracking',
    COUNT(*)
FROM order_tracking
UNION ALL
SELECT 
    'quick_messages',
    COUNT(*)
FROM quick_messages;

-- =====================================================
-- انتهى السكريبت!
-- =====================================================
