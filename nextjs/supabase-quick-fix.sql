-- =================================================================
-- سكريبت إكمال قاعدة البيانات - انسخ كله ونفذ في Supabase SQL Editor
-- =================================================================

-- ==== ١. إنشاء الجداول ====

CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'both')),
    trigger_event TEXT NOT NULL CHECK (trigger_event IN ('manual', 'order_placed', 'order_confirmed', 'order_processing', 'order_shipped', 'order_delivered', 'order_cancelled', 'payment_received', 'payment_failed', 'tracking_added', 'return_requested', 'refund_processed')),
    subject TEXT,
    body_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- ==== ٢. إضافة أعمدة لجدول المنتجات ====

ALTER TABLE products ADD COLUMN IF NOT EXISTS appscenic_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS zendrop_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- ==== ٣. إنشاء الفهارس ====

CREATE INDEX IF NOT EXISTS idx_communication_logs_order ON communication_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_tracking ON order_tracking(tracking_number);
CREATE INDEX IF NOT EXISTS idx_products_appscenic_id ON products(appscenic_id);
CREATE INDEX IF NOT EXISTS idx_products_zendrop_id ON products(zendrop_id);

-- ==== ٤. إدخال البيانات الافتراضية ====

INSERT INTO platform_settings (id, config) VALUES ('default', '{"platform":"local","local":{"enabled":true},"zendrop":{"enabled":false},"appscenic":{"enabled":false}}}')
ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config;

-- ==== ٥. إدخال القوالب (إذا لم تكن موجودة) ====

INSERT INTO notification_templates (name, description, channel, trigger_event, subject, body_content, is_active)
SELECT 'تأكيد الطلب', 'إشعار عند تأكيد استلام الطلب', 'email', 'order_confirmed', 'تم تأكيد طلبك #{{order_id}}', 
'مرحباً {{customer_first_name}}،

شكراً لطلبك! لقد استلمنا طلبك رقم {{order_id}} ونعمل على تحضيره الآن.

تفاصيل الطلب:
- رقم الطلب: {{order_id}}
- الإجمالي: {{order_total}}

سنرسل لك تحديثاً فور شحن الطلب.

مع خالص التحية،', true
WHERE NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'تأكيد الطلب');

INSERT INTO notification_templates (name, description, channel, trigger_event, subject, body_content, is_active)
SELECT 'شحن الطلب', 'إشعار عند شحن الطلب', 'email', 'order_shipped', 'تم شحن طلبك #{{order_id}}',
'مرحباً {{customer_first_name}}،

ممتاز! تم شحن طلبك رقم {{order_id}}.

معلومات الشحن:
- شركة الشحن: {{carrier_name}}
- رقم التتبع: {{tracking_number}}

رابط التتبع: {{tracking_url}}

يمكنك استخدام هذا الرابط لمتابعة شحنتك.

مع خالص التحية،', true
WHERE NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'شحن الطلب');

INSERT INTO notification_templates (name, description, channel, trigger_event, subject, body_content, is_active)
SELECT 'إشعار التتبع', 'إشعار تلقائي عند إضافة رقم تتبع', 'email', 'tracking_added', 'رابط تتبع طلبك #{{order_id}}',
'مرحباً {{customer_first_name}}،

تم إضافة معلومات التتبع لطلبك رقم {{order_id}}.

شركة الشحن: {{carrier_name}}
رقم التتبع: {{tracking_number}}

رابط التتبع: {{tracking_url}}

مع خالص التحية،', true
WHERE NOT EXISTS (SELECT 1 FROM notification_templates WHERE name = 'إشعار التتبع');

-- ==== ٦. إدخال الرسائل السريعة ====

INSERT INTO quick_messages (title, content, channel, category, icon, color, is_pinned)
SELECT 'شكراً للطلب', 'شكراً لطلبك! نقدر اختيارك لنا.', 'email', 'شكر', '🎁', '#10B981', true
WHERE NOT EXISTS (SELECT 1 FROM quick_messages WHERE title = 'شكراً للطلب');

INSERT INTO quick_messages (title, content, channel, category, icon, color, is_pinned)
SELECT 'تأكيد الشحن', 'تم شحن طلبك اليوم.', 'sms', 'شحن', '📦', '#3B82F6', false
WHERE NOT EXISTS (SELECT 1 FROM quick_messages WHERE title = 'تأكيد الشحن');

-- ==== ٧. التحقق من النتائج ====

SELECT 'تم إنشاء الجداول بنجاح!' as status;

SELECT table_name, (SELECT COUNT(*) FROM information_schema.tables t WHERE t.table_name = information_schema.tables.table_name) as exists_check
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('platform_settings', 'notification_templates', 'communication_logs', 'order_tracking', 'quick_messages');
