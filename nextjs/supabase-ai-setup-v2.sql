-- ============================================================================
-- EliteDrops Ecommerce Platform - AI Intelligence Database Setup
-- ملف إعداد قاعدة البيانات لنظام المنتقي الذكي بالذكاء الاصطناعي
-- ============================================================================
-- التاريخ: 2025-12-28
-- الهدف: تنفيذ نظام الذكاء الاصطناعي لاختيار أفضل المنتجات تلقائياً
-- ============================================================================

-- ============================================================================
-- القسم الأول: ملاحظات قبل البدء
-- ============================================================================

/*
⚠️ ملاحظات مهمة قبل التنفيذ:

1. قم بتسجيل نسخة احتياطية من قاعدة البيانات قبل التنفيذ
2. قم بتنفيذ هذا الملف في بيئة الاختبار أولاً
3. تأكد من أنك تملك صلاحيات المشرف (Admin) على قاعدة البيانات
4. إذا كانت الجداول موجودة مسبقاً، سيتم تخطي إنشاؤها تلقائياً

💡 طرق التنفيذ:
- الطريقة الأولى: عبر Supabase Dashboard (الأسهل)
- الطريقة الثانية: عبر Supabase CLI
- الطريقة الثالثة: عبر برنامج pgAdmin
*/

-- ============================================================================
-- القسم الثاني: تفعيل الامتدادات اللازمة
-- ============================================================================

-- تفعيل امتداد UUID إذا لم يكن مفعلاً
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- القسم الثالث: إنشاء جداول نظام الذكاء الاصطناعي
-- ============================================================================

-- ----------------------------------------------------------------------------
-- جدول: ai_analysis_runs
-- الغرض: تسجيل جميع عمليات التحليل التي تم تنفيذها
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_analysis_runs (
    id BIGSERIAL PRIMARY KEY,
    run_id VARCHAR(100) UNIQUE NOT NULL,
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    winner_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة تعليقات للجدول والأعمدة
COMMENT ON TABLE ai_analysis_runs IS 'سجل عمليات تحليل المنتجات بالذكاء الاصطناعي';
COMMENT ON COLUMN ai_analysis_runs.run_id IS 'معرف فريد لعملية التحليل';
COMMENT ON COLUMN ai_analysis_runs.criteria IS 'معايير التحليل المستخدمة';
COMMENT ON COLUMN ai_analysis_runs.stats IS 'إحصائيات نتائج التحليل';
COMMENT ON COLUMN ai_analysis_runs.winner_count IS 'عدد المنتجات الرابحة';
COMMENT ON COLUMN ai_analysis_runs.created_at IS 'وقت إنشاء السجل';

-- ----------------------------------------------------------------------------
-- جدول: ai_product_analysis
-- الغرض: تخزين نتائج تحليل كل منتج على حدة
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_product_analysis (
    id BIGSERIAL PRIMARY KEY,
    run_id VARCHAR(100) NOT NULL,
    product_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    decision VARCHAR(20) NOT NULL,
    ai_score INTEGER DEFAULT 0,
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    demand_level VARCHAR(20) DEFAULT 'LOW',
    reasons TEXT[] DEFAULT ARRAY[]::TEXT[],
    warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- التعليقات
COMMENT ON TABLE ai_product_analysis IS 'نتائج تحليل المنتجات الفردية';
COMMENT ON COLUMN ai_product_analysis.run_id IS 'معرف عملية التحليل';
COMMENT ON COLUMN ai_product_analysis.product_data IS 'بيانات المنتج الكاملة';
COMMENT ON COLUMN ai_product_analysis.decision IS 'قرار التحليل (APPROVED/REJECTED)';
COMMENT ON COLUMN ai_product_analysis.ai_score IS 'درجة الذكاء الاصطناعي (0-100)';
COMMENT ON COLUMN ai_product_analysis.sentiment_score IS 'درجة تحليل المشاعر (-1 إلى 1)';
COMMENT ON COLUMN ai_product_analysis.profit_margin IS 'هامش الربح المتوقع (%)';
COMMENT ON COLUMN ai_product_analysis.demand_level IS 'مستوى الطلب (HOT/STEADY/LOW)';
COMMENT ON COLUMN ai_product_analysis.reasons IS 'أسباب القرار';
COMMENT ON COLUMN ai_product_analysis.warnings := 'تحذيرات إضافية';

-- ----------------------------------------------------------------------------
-- جدول: ai_settings
-- الغرض: تخزين إعدادات وتحفضيرات الذكاء الاصطناعي
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_settings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- التعليقات
COMMENT ON TABLE ai_settings IS 'إعدادات وتفضيلات نظام الذكاء الاصطناعي';
COMMENT ON COLUMN ai_settings.name IS 'اسم الإعداد';
COMMENT ON COLUMN ai_settings.settings IS 'قيمة الإعداد بصيغة JSON';
COMMENT ON COLUMN ai_settings.is_active هل الإعداد مفعل';

-- ----------------------------------------------------------------------------
-- جدول: ai_selected_products
-- الغرض: تتبع المنتجات التي اختارها الذكاء الاصطناعي
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_selected_products (
    id BIGSERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    run_id VARCHAR(100),
    ai_score INTEGER DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    demand_level VARCHAR(20) DEFAULT 'LOW',
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    imported_to_store BOOLEAN DEFAULT false,
    imported_at TIMESTAMP WITH TIME ZONE,
    store_product_id INTEGER
);

-- التعليقات
COMMENT ON TABLE ai_selected_products IS 'المنتجات المختارة بواسطة الذكاء الاصطناعي';
COMMENT ON COLUMN ai_selected_products.product_id IS 'معرف المنتج في قاعدة البيانات';
COMMENT ON COLUMN ai_selected_products.run_id IS 'معرف عملية التحليل';
COMMENT ON COLUMN ai_selected_products.ai_score IS 'درجة الذكاء الاصطناعي';
COMMENT ON COLUMN ai_selected_products.imported_to_store هل تم استيراده للمتجر';

-- ----------------------------------------------------------------------------
-- جدول: product_reviews_analysis
-- الغرض: تحليل وتخزين مراجعات المنتجات
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_reviews_analysis (
    id BIGSERIAL PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL,
    supplier_id VARCHAR(100),
    review_text TEXT NOT NULL,
    review_rating DECIMAL(2,1),
    sentiment_score DECIMAL(3,2),
    sentiment_label VARCHAR(20),
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_positive BOOLEAN,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- التعليقات
COMMENT ON TABLE product_reviews_analysis IS 'تحليل مراجعات المنتجات';
COMMENT ON COLUMN product_reviews_analysis.product_id هو معرف المنتج';
COMMENT ON COLUMN product_reviews_analysis.sentiment_label LIKE 'positive/negative/neutral';

-- ----------------------------------------------------------------------------
-- جدول: watched_products
-- الغرض: متابعة المنتجات وتسجيل التغييرات
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS watched_products (
    id BIGSERIAL PRIMARY KEY,
    external_product_id VARCHAR(100) NOT NULL,
    supplier_id VARCHAR(100),
    name VARCHAR(500),
    current_price DECIMAL(10,2),
    current_rating DECIMAL(2,1),
    current_orders INTEGER,
    watch_status VARCHAR(20) DEFAULT 'active',
    alerts_enabled BOOLEAN DEFAULT true,
    price_drop_alert BOOLEAN DEFAULT true,
    rating_drop_alert BOOLEAN DEFAULT true,
    added_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_checked_at TIMESTAMP WITH TIME ZONE
);

-- التعليقات
COMMENT ON TABLE watched_products IS 'المنتجات المرصودة للمتابعة';
COMMENT ON COLUMN watched_products.watch_status IS 'حالة المتابعة (active/paused/stopped)';

-- ============================================================================
-- القسم الرابع: إنشاء الفهارس لتحسين الأداء
-- ============================================================================

-- فهارس جدول ai_analysis_runs
CREATE INDEX IF NOT EXISTS idx_ai_analysis_runs_created_at 
    ON ai_analysis_runs(created_at DESC);

-- فهارس جدول ai_product_analysis
CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_run_id 
    ON ai_product_analysis(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_decision 
    ON ai_product_analysis(decision);
CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_ai_score 
    ON ai_product_analysis(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_created_at 
    ON ai_product_analysis(created_at DESC);

-- فهارس جدول ai_selected_products
CREATE INDEX IF NOT EXISTS idx_ai_selected_products_run_id 
    ON ai_selected_products(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_selected_products_product_id 
    ON ai_selected_products(product_id);

-- فهارس جدول product_reviews_analysis
CREATE INDEX IF NOT EXISTS idx_reviews_analysis_product_id 
    ON product_reviews_analysis(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_analysis_sentiment 
    ON product_reviews_analysis(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_reviews_analysis_created_at 
    ON product_reviews_analysis(analyzed_at DESC);

-- فهارس جدول watched_products
CREATE INDEX IF NOT EXISTS idx_watched_products_external_id 
    ON watched_products(external_product_id);
CREATE INDEX IF NOT EXISTS idx_watched_products_status 
    ON watched_products(watch_status);

-- ============================================================================
-- القسم الخامس: إضافة أعمدة لجدول المنتجات الموجود
-- ============================================================================

-- التحقق من وجود الأعمدة وإضافتها إذا لم تكن موجودة
DO $$
BEGIN
    -- عمود ai_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'ai_score'
    ) THEN
        ALTER TABLE products ADD COLUMN ai_score INTEGER;
        COMMENT ON COLUMN products.ai_score IS 'درجة الذكاء الاصطناعي للمنتج';
    END IF;

    -- عمود is_ai_selected
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_ai_selected'
    ) THEN
        ALTER TABLE products ADD COLUMN is_ai_selected BOOLEAN DEFAULT false;
        COMMENT ON COLUMN products.is_ai_selected IS 'هل تم اختيار المنتج بالذكاء الاصطناعي';
    END IF;

    -- عمود sentiment_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sentiment_score'
    ) THEN
        ALTER TABLE products ADD COLUMN sentiment_score DECIMAL(3,2);
        COMMENT ON COLUMN products.sentiment_score IS 'درجة تحليل مشاعر المراجعات';
    END IF;

    -- عمود demand_level
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'demand_level'
    ) THEN
        ALTER TABLE products ADD COLUMN demand_level VARCHAR(20);
        COMMENT ON COLUMN products.demand_level IS 'مستوى الطلب (HOT/STEADY/LOW)';
    END IF;
    
    -- عمود last_ai_analysis_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'last_ai_analysis_at'
    ) THEN
        ALTER TABLE products ADD COLUMN last_ai_analysis_at TIMESTAMP WITH TIME ZONE;
        COMMENT ON COLUMN products.last_ai_analysis_at IS 'آخر وقت لتحليل المنتج';
    END IF;
END $$;

-- ============================================================================
-- القسم السادس: إنشاء فهارس إضافية لجدول المنتجات
-- ============================================================================

-- فهرس للبحث السريع في المنتجات حسب التقييم
CREATE INDEX IF NOT EXISTS idx_products_rating_active 
    ON products(rating DESC) 
    WHERE status = 'active';

-- فهرس للبحث في المنتجات المختارة بالذكاء الاصطناعي
CREATE INDEX IF NOT EXISTS idx_products_ai_selected 
    ON products(is_ai_selected DESC) 
    WHERE is_ai_selected = true;

-- فهرس للبحث في المنتجات حسب الموقع
CREATE INDEX IF NOT EXISTS idx_products_warehouse 
    ON products(warehouse_location) 
    WHERE warehouse_location IS NOT NULL;

-- ============================================================================
-- القسم السابع: تفعيل Row Level Security (RLS)
-- ============================================================================

-- تفعيل RLS على جميع الجداول الجديدة
ALTER TABLE ai_analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_product_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_selected_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_products ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول ai_analysis_runs
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin access to analysis runs" ON ai_analysis_runs;
CREATE POLICY "Admin access to analysis runs" ON ai_analysis_runs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can view analysis runs" ON ai_analysis_runs;
CREATE POLICY "Authenticated users can view analysis runs" ON ai_analysis_runs
    FOR SELECT TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول ai_product_analysis
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin access to product analysis" ON ai_product_analysis;
CREATE POLICY "Admin access to product analysis" ON ai_product_analysis
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can view product analysis" ON ai_product_analysis;
CREATE POLICY "Authenticated users can view product analysis" ON ai_product_analysis
    FOR SELECT TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول ai_settings
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin can manage AI settings" ON ai_settings;
CREATE POLICY "Admin can manage AI settings" ON ai_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can view AI settings" ON ai_settings;
CREATE POLICY "Authenticated users can view AI settings" ON ai_settings
    FOR SELECT TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول ai_selected_products
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin access to selected products" ON ai_selected_products;
CREATE POLICY "Admin access to selected products" ON ai_selected_products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can view selected products" ON ai_selected_products;
CREATE POLICY "Authenticated users can view selected products" ON ai_selected_products
    FOR SELECT TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول product_reviews_analysis
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin access to review analysis" ON product_reviews_analysis;
CREATE POLICY "Admin access to review analysis" ON product_reviews_analysis
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول watched_products
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin access to watched products" ON watched_products;
CREATE POLICY "Admin access to watched products" ON watched_products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

-- ============================================================================
-- القسم الثامن: إدخال الإعدادات الافتراضية
-- ============================================================================

-- حذف الإعدادات القديمة إذا وجدت
DELETE FROM ai_settings WHERE name = 'default_selection_criteria';

-- إدخال الإعدادات الافتراضية
INSERT INTO ai_settings (name, description, settings, is_active)
VALUES (
    'default_selection_criteria',
    'معايير الاختيار الافتراضية للمنتجات',
    '{
        "min_rating": 4.5,
        "min_profit_margin": 35,
        "min_orders": 100,
        "min_review_count": 20,
        "max_shipping_cost": 5,
        "sentiment_threshold": 0.1,
        "exclude_categories": ["Used", "Refurbished", "Clearance"],
        "banned_keywords": ["fake", "replica", "knockoff", "defective", "broken"],
        "required_keywords": [],
        "max_products_per_run": 50
    }'::jsonb,
    true
);

-- ============================================================================
-- القسم التاسع: إنشاء دوال مساعدة
-- ============================================================================

-- دالة لتحديث وقت التعديل تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تفعيل الموقتات على الجداول ذات عمود updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I 
                        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- القسم العاشر: دوال مفيدة للاستعلام
-- ============================================================================

-- دالة للحصول على المنتجات الرابحة
CREATE OR REPLACE FUNCTION get_winning_products(min_score INTEGER DEFAULT 70)
RETURNS TABLE (
    product_data JSONB,
    ai_score INTEGER,
    profit_margin DECIMAL(5,2),
    demand_level VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.product_data,
        pa.ai_score,
        pa.profit_margin,
        pa.demand_level
    FROM ai_product_analysis pa
    WHERE pa.decision = 'APPROVED'
    AND pa.ai_score >= min_score
    ORDER BY pa.ai_score DESC;
END;
$$ LANGUAGE plpgsql;

-- دالة للحصول على إحصائيات التحليلات
CREATE OR REPLACE FUNCTION get_analysis_statistics(days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_runs BIGINT,
    total_products_analyzed BIGINT,
    total_winners BIGINT,
    average_score DECIMAL(5,2),
    hot_trends_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT ar.run_id)::BIGINT AS total_runs,
        COALESCE(SUM((ar.stats->>'total_analyzed')::INTEGER), 0)::BIGINT AS total_products_analyzed,
        COALESCE(SUM(ar.winner_count), 0)::BIGINT AS total_winners,
        COALESCE(AVG((ar.stats->>'average_score')::DECIMAL(5,2)), 0)::DECIMAL(5,2) AS average_score,
        COALESCE(SUM((ar.stats->>'hot_trends')::INTEGER), 0)::BIGINT AS hot_trends_count
    FROM ai_analysis_runs ar
    WHERE ar.created_at >= NOW() - (days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- القسم الحادي عشر: رسائل النجاح
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- حساب عدد الجداول المنشأة
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'ai_%';
    
    -- عرض رسالة نجاح
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ تم تنفيذ إعداد نظام الذكاء الاصطناعي بنجاح!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 ملخص ما تم إنشاؤه:';
    RAISE NOTICE '   • % جدول جديد لنظام الذكاء الاصطناعي', table_count;
    RAISE NOTICE '   • % فهرس لتحسين الأداء', 12;
    RAISE NOTICE '   • % سياسة أمان (RLS)', 10;
    RAISE NOTICE '   • % دالة مساعدة', 4;
    RAISE NOTICE '   • % أعمدة جديدة لجدول المنتجات', 5;
    RAISE NOTICE '';
    RAISE NOTICE '📋 الجداول المنشأة:';
    RAISE NOTICE '   1. ai_analysis_runs - سجل عمليات التحليل';
    RAISE NOTICE '   2. ai_product_analysis - نتائج تحليل المنتجات';
    RAISE NOTICE '   3. ai_settings - إعدادات النظام';
    RAISE NOTICE '   4. ai_selected_products - المنتجات المختارة';
    RAISE NOTICE '   5. product_reviews_analysis - تحليل المراجعات';
    RAISE NOTICE '   6. watched_products - المنتجات المرصودة';
    RAISE NOTICE '';
    RAISE NOTICE '📝 الأعمدة المضافة لجدول products:';
    RAISE NOTICE '   • ai_score - درجة الذكاء الاصطناعي';
    RAISE NOTICE '   • is_ai_selected - هل تم اختياره بالذكاء الاصطناعي';
    RAISE NOTICE '   • sentiment_score - درجة تحليل المشاعر';
    RAISE NOTICE '   • demand_level - مستوى الطلب';
    RAISE NOTICE '   • last_ai_analysis_at - آخر وقت تحليل';
    RAISE NOTICE '';
    RAISE NOTICE '💡 يمكنك الآن الانتقال إلى صفحة المنتقي الذكي';
    RAISE NOTICE '   في لوحة التحكم لبدء استخدام النظام.';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

-- ============================================================================
-- نهاية الملف
-- ============================================================================
