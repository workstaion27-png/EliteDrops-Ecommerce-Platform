-- ============================================================================
-- EliteDrops Ecommerce Platform - AI Intelligence Database Setup (مُصلح)
-- ============================================================================
-- التاريخ: 2025-12-28
-- الإصلاح: تغيير integer إلى uuid للتوافق مع جدول products
-- ============================================================================

-- ============================================================================
-- القسم الأول: حذف السياسات والأعمدة الموجودة أولاً
-- ============================================================================

DO $$
BEGIN
    -- حذف السياسات
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_selected_products') THEN
        DROP POLICY IF EXISTS "Admin access to selected products" ON ai_selected_products;
        DROP POLICY IF EXISTS "Authenticated users can view selected products" ON ai_selected_products;
    END IF;

    -- حذف الجدول إذا كان موجوداً
    DROP TABLE IF EXISTS ai_selected_products CASCADE;
END $$;

-- ============================================================================
-- القسم الثاني: إنشاء جداول نظام الذكاء الاصطناعي
-- ============================================================================

-- جدول ai_analysis_runs
CREATE TABLE IF NOT EXISTS ai_analysis_runs (
    id BIGSERIAL PRIMARY KEY,
    run_id VARCHAR(100) UNIQUE NOT NULL,
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    winner_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE ai_analysis_runs IS 'سجل عمليات تحليل المنتجات بالذكاء الاصطناعي';

-- جدول ai_product_analysis
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

COMMENT ON TABLE ai_product_analysis IS 'نتائج تحليل المنتجات الفردية';

-- جدول ai_settings
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

COMMENT ON TABLE ai_settings IS 'إعدادات وتفضيلات نظام الذكاء الاصطناعي';

-- جدول ai_selected_products (مُصلح - يستخدم uuid بدلاً من integer)
CREATE TABLE IF NOT EXISTS ai_selected_products (
    id BIGSERIAL PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    run_id VARCHAR(100),
    ai_score INTEGER DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    demand_level VARCHAR(20) DEFAULT 'LOW',
    selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    imported_to_store BOOLEAN DEFAULT false,
    imported_at TIMESTAMP WITH TIME ZONE,
    store_product_id INTEGER
);

COMMENT ON TABLE ai_selected_products IS 'المنتجات المختارة بواسطة الذكاء الاصطناعي';

-- جدول product_reviews_analysis
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

COMMENT ON TABLE product_reviews_analysis IS 'تحليل مراجعات المنتجات';

-- جدول watched_products
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
    added_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_checked_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE watched_products IS 'المنتجات المرصودة للمتابعة';

-- ============================================================================
-- القسم الثالث: إنشاء الفهارس
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_run_id ON ai_product_analysis(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_ai_score ON ai_product_analysis(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_selected_products_product_id ON ai_selected_products(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_analysis_product_id ON product_reviews_analysis(product_id);
CREATE INDEX IF NOT EXISTS idx_watched_products_status ON watched_products(watch_status);
CREATE INDEX IF NOT EXISTS idx_products_rating_active ON products(rating DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_ai_selected ON products(is_ai_selected DESC) WHERE is_ai_selected = true;

-- ============================================================================
-- القسم الرابع: إضافة أعمدة لجدول المنتجات
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ai_score') THEN
        ALTER TABLE products ADD COLUMN ai_score INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_ai_selected') THEN
        ALTER TABLE products ADD COLUMN is_ai_selected BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sentiment_score') THEN
        ALTER TABLE products ADD COLUMN sentiment_score DECIMAL(3,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'demand_level') THEN
        ALTER TABLE products ADD COLUMN demand_level VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'last_ai_analysis_at') THEN
        ALTER TABLE products ADD COLUMN last_ai_analysis_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ============================================================================
-- القسم الخامس: تفعيل RLS وإنشاء السياسات
-- ============================================================================

ALTER TABLE ai_analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_product_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_selected_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_products ENABLE ROW LEVEL SECURITY;

-- سياسات ai_analysis_runs
CREATE POLICY "Admin access to analysis runs" ON ai_analysis_runs FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.jwt()->>'email'));

CREATE POLICY "Authenticated users can view analysis runs" ON ai_analysis_runs FOR SELECT TO authenticated
USING (true);

-- سياسات ai_product_analysis
CREATE POLICY "Admin access to product analysis" ON ai_product_analysis FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.jwt()->>'email'));

CREATE POLICY "Authenticated users can view product analysis" ON ai_product_analysis FOR SELECT TO authenticated
USING (true);

-- سياسات ai_settings
CREATE POLICY "Admin can manage AI settings" ON ai_settings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.jwt()->>'email'));

-- سياسات ai_selected_products
CREATE POLICY "Admin access to selected products" ON ai_selected_products FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.jwt()->>'email'));

CREATE POLICY "Authenticated users can view selected products" ON ai_selected_products FOR SELECT TO authenticated
USING (true);

-- سياسات product_reviews_analysis
CREATE POLICY "Admin access to review analysis" ON product_reviews_analysis FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.jwt()->>'email'));

-- سياسات watched_products
CREATE POLICY "Admin access to watched products" ON watched_products FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = auth.jwt()->>'email'));

-- ============================================================================
-- القسم السادس: إدخال الإعدادات الافتراضية
-- ============================================================================

DELETE FROM ai_settings WHERE name = 'default_selection_criteria';

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
-- القسم السابع: رسالة النجاح
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'ai_%';
    
    RAISE NOTICE '============================================================';
    RAISE NOTICE '   تم تنفيذ إعداد نظام الذكاء الاصطناعي بنجاح!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '📊 الجداول المنشأة: %', table_count;
    RAISE NOTICE '💡 يمكنك الآن استخدام المنتقي الذكي';
END $$;

-- ============================================================================
-- نهاية الملف
-- ============================================================================
