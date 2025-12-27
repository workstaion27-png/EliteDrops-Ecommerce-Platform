-- ==============================================
-- AI Product Intelligence Database Schema
-- تحديث قاعدة البيانات لنظام المنتقي الذكي
-- ==============================================

-- التحقق من وجود الجداول وإنشاؤها إذا لم تكن موجودة
DO $$ 
BEGIN
    -- جدول سجل عمليات التحليل
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'ai_analysis_runs') THEN
        CREATE TABLE ai_analysis_runs (
            id BIGSERIAL PRIMARY KEY,
            run_id VARCHAR(100) UNIQUE NOT NULL,
            criteria JSONB NOT NULL DEFAULT '{}',
            stats JSONB NOT NULL DEFAULT '{}',
            winner_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- تفعيل RLS
        ALTER TABLE ai_analysis_runs ENABLE ROW LEVEL SECURITY;
        
        -- سياسات الوصول
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
    END IF;

    -- جدول نتائج تحليل المنتجات
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'ai_product_analysis') THEN
        CREATE TABLE ai_product_analysis (
            id BIGSERIAL PRIMARY KEY,
            run_id VARCHAR(100) NOT NULL,
            product_data JSONB NOT NULL DEFAULT '{}',
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
        
        -- تفعيل RLS
        ALTER TABLE ai_product_analysis ENABLE ROW LEVEL SECURITY;
        
        -- فهرس لتحسين الأداء
        CREATE INDEX idx_ai_product_analysis_run_id ON ai_product_analysis(run_id);
        CREATE INDEX idx_ai_product_analysis_decision ON ai_product_analysis(decision);
        CREATE INDEX idx_ai_product_analysis_ai_score ON ai_product_analysis(ai_score DESC);
        
        -- سياسات الوصول
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
    END IF;

    -- جدول إعدادات الذكاء الاصطناعي
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'ai_settings') THEN
        CREATE TABLE ai_settings (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            settings JSONB NOT NULL DEFAULT '{}',
            is_active BOOLEAN DEFAULT true,
            created_by VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- تفعيل RLS
        ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
        
        -- سياسات الوصول
        CREATE POLICY "Admin can manage AI settings" ON ai_settings
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM admin_users 
                    WHERE admin_users.email = auth.jwt()->>'email'
                )
            );
            
        CREATE POLICY "Authenticated users can view AI settings" ON ai_product_analysis
            FOR SELECT TO authenticated
            USING (true);
            
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
    END IF;

    -- جدول المنتجات المختارة بواسطة الذكاء الاصطناعي
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'ai_selected_products') THEN
        CREATE TABLE ai_selected_products (
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
        
        -- تفعيل RLS
        ALTER TABLE ai_selected_products ENABLE ROW LEVEL SECURITY;
        
        -- فهرس
        CREATE INDEX idx_ai_selected_products_run_id ON ai_selected_products(run_id);
        CREATE INDEX idx_ai_selected_products_product_id ON ai_selected_products(product_id);
        
        -- سياسات الوصول
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
    END IF;

    -- جدول سجل المراجعات للتحليل
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_reviews_analysis') THEN
        CREATE TABLE product_reviews_analysis (
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
        
        -- تفعيل RLS
        ALTER TABLE product_reviews_analysis ENABLE ROW LEVEL SECURITY;
        
        -- فهرس
        CREATE INDEX idx_reviews_analysis_product_id ON product_reviews_analysis(product_id);
        CREATE INDEX idx_reviews_analysis_sentiment ON product_reviews_analysis(sentiment_label);
        
        -- سياسات الوصول
        CREATE POLICY "Admin access to review analysis" ON product_reviews_analysis
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM admin_users 
                    WHERE admin_users.email = auth.jwt()->>'email'
                )
            );
    END IF;

    -- جدول المنتجات المرصودة (للمتابعة)
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'watched_products') THEN
        CREATE TABLE watched_products (
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
        
        -- تفعيل RLS
        ALTER TABLE watched_products ENABLE ROW LEVEL SECURITY;
        
        -- فهرس
        CREATE INDEX idx_watched_products_external_id ON watched_products(external_product_id);
        CREATE INDEX idx_watched_products_status ON watched_products(watch_status);
        
        -- سياسات الوصول
        CREATE POLICY "Admin access to watched products" ON watched_products
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM admin_users 
                    WHERE admin_users.email = auth.jwt()->>'email'
                )
            );
    END IF;

    -- دالة لتحديث وقت التعديل
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- تفعيل الدالة على الجداول المناسبة
    DO $$
    DECLARE
        t text;
    BEGIN
        FOR t IN 
            SELECT table_name 
            FROM information_schema.columns 
            WHERE column_name = 'updated_at'
            AND table_schema = 'public'
        LOOP
            EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
            EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;

    -- إضافة أعمدة جديدة لجدول المنتجات الحالي إذا لم تكن موجودة
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'ai_score'
        ) THEN
            ALTER TABLE products ADD COLUMN ai_score INTEGER;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'is_ai_selected'
        ) THEN
            ALTER TABLE products ADD COLUMN is_ai_selected BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'sentiment_score'
        ) THEN
            ALTER TABLE products ADD COLUMN sentiment_score DECIMAL(3,2);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'demand_level'
        ) THEN
            ALTER TABLE products ADD COLUMN demand_level VARCHAR(20);
        END IF;
    END;
    $$ LANGUAGE plpgsql;

    RAISE NOTICE 'تم إنشاء جداول نظام الذكاء الاصطناعي بنجاح';
END $$;

-- ==============================================
-- إنشاء فهارس إضافية لتحسين الأداء
-- ==============================================

-- فهرس للبحث السريع في المنتجات حسب التقييم
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC) WHERE status = 'active';

-- فهرس للبحث في المنتجات المختارة بالذكاء الاصطناعي
CREATE INDEX IF NOT EXISTS idx_products_ai_selected ON products(is_ai_selected DESC) WHERE is_ai_selected = true;

-- فهرس للبحث في الطلبات حسب الموقع
CREATE INDEX IF NOT EXISTS idx_products_warehouse ON products(warehouse_location) WHERE warehouse_location IS NOT NULL;

-- ==============================================
-- عرض ملخص الجداول المنشأة
-- ==============================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'ai_%';
    
    RAISE NOTICE 'تم إنشاء % جدول لنظام الذكاء الاصطناعي', table_count;
    
    RAISE NOTICE '
    الجداول المنشأة:
    - ai_analysis_runs: سجل عمليات التحليل
    - ai_product_analysis: نتائج تحليل المنتجات
    - ai_settings: إعدادات الذكاء الاصطناعي
    - ai_selected_products: المنتجات المختارة
    - product_reviews_analysis: تحليل المراجعات
    - watched_products: المنتجات المرصودة
    
    الأعمدة المضافة لجدول products:
    - ai_score: درجة الذكاء الاصطناعي
    - is_ai_selected: هل تم اختياره بالذكاء الاصطناعي
    - sentiment_score: درجة تحليل المشاعر
    - demand_level: مستوى الطلب
    ';
END $$;
