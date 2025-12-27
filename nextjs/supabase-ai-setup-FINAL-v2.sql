-- ============================================================================
-- EliteDrops Ecommerce Platform - AI Intelligence Database Setup (مُصلح)
-- ============================================================================
-- التاريخ: 2025-12-28
-- ============================================================================

-- ============================================================================
-- القسم الأول: حذف السياسات الموجودة أولاً
-- ============================================================================

DO $$
BEGIN
    -- حذف سياسات جدول ai_analysis_runs
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_analysis_runs' AND policyname = 'Admin access to analysis runs') THEN
        DROP POLICY IF EXISTS "Admin access to analysis runs" ON ai_analysis_runs;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_analysis_runs' AND policyname = 'Authenticated users can view analysis runs') THEN
        DROP POLICY IF EXISTS "Authenticated users can view analysis runs" ON ai_analysis_runs;
    END IF;

    -- حذف سياسات جدول ai_product_analysis
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_product_analysis' AND policyname = 'Admin access to product analysis') THEN
        DROP POLICY IF EXISTS "Admin access to product analysis" ON ai_product_analysis;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_product_analysis' AND policyname = 'Authenticated users can view product analysis') THEN
        DROP POLICY IF EXISTS "Authenticated users can view product analysis" ON ai_product_analysis;
    END IF;

    -- حذف سياسات جدول categories (المشكلة الرئيسية)
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Categories access') THEN
        DROP POLICY IF EXISTS "Categories access" ON categories;
    END IF;

    -- حذف سياسات جدول ai_settings
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_settings' AND policyname = 'Admin can manage AI settings') THEN
        DROP POLICY IF EXISTS "Admin can manage AI settings" ON ai_settings;
    END IF;

    -- حذف سياسات جدول ai_selected_products
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_selected_products' AND policyname = 'Admin access to selected products') THEN
        DROP POLICY IF EXISTS "Admin access to selected products" ON ai_selected_products;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_selected_products' AND policyname = 'Authenticated users can view selected products') THEN
        DROP POLICY IF EXISTS "Authenticated users can view selected products" ON ai_selected_products;
    END IF;

    -- حذف سياسات جدول product_reviews_analysis
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews_analysis' AND policyname = 'Admin access to review analysis') THEN
        DROP POLICY IF EXISTS "Admin access to review analysis" ON product_reviews_analysis;
    END IF;

    -- حذف سياسات جدول watched_products
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'watched_products' AND policyname = 'Admin access to watched products') THEN
        DROP POLICY IF EXISTS "Admin access to watched products" ON watched_products;
    END IF;
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
COMMENT ON COLUMN ai_analysis_runs.run_id IS 'معرف فريد لعملية التحليل';
COMMENT ON COLUMN ai_analysis_runs.criteria IS 'معايير التحليل المستخدمة';
COMMENT ON COLUMN ai_analysis_runs.stats IS 'إحصائيات نتائج التحليل';
COMMENT ON COLUMN ai_analysis_runs.winner_count IS 'عدد المنتجات الرابحة';
COMMENT ON COLUMN ai_analysis_runs.created_at IS 'وقت إنشاء السجل';

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
COMMENT ON COLUMN ai_product_analysis.run_id IS 'معرف عملية التحليل';
COMMENT ON COLUMN ai_product_analysis.product_data IS 'بيانات المنتج الكاملة';
COMMENT ON COLUMN ai_product_analysis.decision IS 'قرار التحليل (APPROVED/REJECTED)';
COMMENT ON COLUMN ai_product_analysis.ai_score IS 'درجة الذكاء الاصطناعي (0-100)';
COMMENT ON COLUMN ai_product_analysis.sentiment_score IS 'درجة تحليل المشاعر (-1 إلى 1)';
COMMENT ON COLUMN ai_product_analysis.profit_margin IS 'هامش الربح المتوقع (%)';
COMMENT ON COLUMN ai_product_analysis.demand_level IS 'مستوى الطلب (HOT/STEADY/LOW)';
COMMENT ON COLUMN ai_product_analysis.reasons IS 'أسباب القرار';
COMMENT ON COLUMN ai_product_analysis.recommendation IS 'توصية التحليل';

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

-- جدول ai_selected_products
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
    price_drop_alert BOOLEAN DEFAULT true,
    rating_drop_alert BOOLEAN DEFAULT true,
    added_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_checked_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE watched_products IS 'المنتجات المرصودة للمتابعة';
COMMENT ON COLUMN watched_products.watch_status IS 'حالة المتابعة (active/paused/stopped)';

-- ============================================================================
-- القسم الثالث: إنشاء الفهارس لتحسين الأداء
-- ============================================================================

-- فهارس جدول ai_product_analysis
CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_run_id ON ai_product_analysis(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_decision ON ai_product_analysis(decision);
CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_ai_score ON ai_product_analysis(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_product_analysis_created_at ON ai_product_analysis(created_at DESC);

-- فهارس جدول ai_analysis_runs
CREATE INDEX IF NOT EXISTS idx_ai_analysis_runs_created_at ON ai_analysis_runs(created_at DESC);

-- فهارس جدول ai_selected_products
CREATE INDEX IF NOT EXISTS idx_ai_selected_products_run_id ON ai_selected_products(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_selected_products_product_id ON ai_selected_products(product_id);

-- فهارس جدول product_reviews_analysis
CREATE INDEX IF NOT EXISTS idx_reviews_analysis_product_id ON product_reviews_analysis(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_analysis_sentiment ON product_reviews_analysis(sentiment_label);

-- فهارس جدول watched_products
CREATE INDEX IF NOT EXISTS idx_watched_products_external_id ON watched_products(external_product_id);
CREATE INDEX IF NOT EXISTS idx_watched_products_status ON watched_products(watch_status);

-- فهارس إضافية لجدول المنتجات
CREATE INDEX IF NOT EXISTS idx_products_rating_active ON products(rating DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_ai_selected ON products(is_ai_selected DESC) WHERE is_ai_selected = true;

-- ============================================================================
-- القسم الرابع: إضافة أعمدة لجدول المنتجات
-- ============================================================================

DO $$
BEGIN
    -- عمود ai_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'ai_score'
    ) THEN
        ALTER TABLE products ADD COLUMN ai_score INTEGER;
    END IF;

    -- عمود is_ai_selected
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_ai_selected'
    ) THEN
        ALTER TABLE products ADD COLUMN is_ai_selected BOOLEAN DEFAULT false;
    END IF;

    -- عمود sentiment_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sentiment_score'
    ) THEN
        ALTER TABLE products ADD COLUMN sentiment_score DECIMAL(3,2);
    END IF;

    -- عمود demand_level
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'demand_level'
    ) THEN
        ALTER TABLE products ADD COLUMN demand_level VARCHAR(20);
    END IF;

    -- عمود last_ai_analysis_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'last_ai_analysis_at'
    ) THEN
        ALTER TABLE products ADD COLUMN last_ai_analysis_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ============================================================================
-- القسم الخامس: تفعيل Row Level Security (RLS)
-- ============================================================================

ALTER TABLE ai_analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_product_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_selected_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_products ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول ai_analysis_runs
-- ----------------------------------------------------------------------------

CREATE POLICY "Admin access to analysis runs" ON ai_analysis_runs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "Authenticated users can view analysis runs" ON ai_analysis_runs
    FOR SELECT TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول ai_product_analysis
-- ----------------------------------------------------------------------------

CREATE POLICY "Admin access to product analysis" ON ai_product_analysis
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "Authenticated users can view product analysis" ON ai_product_analysis
    FOR SELECT TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول ai_settings
-- ----------------------------------------------------------------------------

CREATE POLICY "Admin can manage AI settings" ON ai_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "Authenticated users can view AI settings" ON ai_settings
    FOR SELECT TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول ai_selected_products
-- ----------------------------------------------------------------------------

CREATE POLICY "Admin access to selected products" ON ai_selected_products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "Authenticated users can view selected products" ON ai_selected_products
    FOR SELECT TO authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- سياسات الوصول لجدول product_reviews_analysis
-- ----------------------------------------------------------------------------

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

CREATE POLICY "Admin access to watched products" ON watched_products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

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
    RAISE NOTICE ' ';
    RAISE NOTICE '📊 ملخص ما تم إنشاؤه:';
    RAISE NOTICE '   • الجداول المنشأة: %', table_count;
    RAISE NOTICE '   • الأعمدة المضافة: 5';
    RAISE NOTICE '   • السياسات: 10';
    RAISE NOTICE '   • الفهارس: 12';
    RAISE NOTICE ' ';
    RAISE NOTICE '💡 يمكنك الآن استخدام صفحة المنتقي الذكي';
    RAISE NOTICE '   في لوحة التحكم (/admin-control/ai-picker)';
    RAISE NOTICE ' ';
    RAISE NOTICE '============================================================';
END $$;

-- ============================================================================
-- نهاية الملف
-- ============================================================================
