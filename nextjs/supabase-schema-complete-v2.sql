-- ============================================================================
-- EliteDrops Complete Database Schema v2.0
-- Updated with Products, Reviews, Warehouses, and Platform Integrations
-- ============================================================================

-- Enable RLS
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- ============================================================================
-- Core Tables
-- ============================================================================

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Suppliers & Warehouses Tables
-- ============================================================================

-- Create suppliers table (for dropshipping integrations)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    api_key TEXT,
    api_secret TEXT,
    supplier_type VARCHAR(50) DEFAULT 'dropshipping' CHECK (supplier_type IN ('dropshipping', 'wholesale', 'manufacturer')),
    country_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warehouses table (US and International)
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    shipping_zones JSONB DEFAULT '[]',
    processing_time_days INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Products Tables
-- ============================================================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table (Enhanced with platform integration)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    
    -- Pricing
    cost_price DECIMAL(10,2),  -- Original cost from supplier
    price DECIMAL(10,2) NOT NULL,  -- Selling price
    compare_price DECIMAL(10,2),  -- Original price (for discounts)
    profit_margin DECIMAL(10,2),  -- Profit percentage
    
    -- Media
    images TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    video_url TEXT,
    
    -- Categorization
    category_id UUID REFERENCES categories(id),
    tags TEXT[] DEFAULT '{}',
    
    -- Inventory & Variants
    sku VARCHAR(100),
    inventory_count INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    track_inventory BOOLEAN DEFAULT true,
    
    -- Platform Integration (KEY for dropshipping)
    source_platform VARCHAR(50) CHECK (source_platform IN ('zendrop', 'cj', 'appscenic', 'local', 'manual')),
    external_product_id VARCHAR(200),
    external_variant_id VARCHAR(200),
    supplier_id UUID REFERENCES suppliers(id),
    warehouse_id UUID REFERENCES warehouses(id),
    
    -- Specifications
    weight DECIMAL(10,3),
    dimensions JSONB DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    
    -- Shipping
    shipping_class VARCHAR(50),
    free_shipping BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    sale_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_variants table (size, color, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Variant Info
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(200),
    
    -- Pricing
    cost_price DECIMAL(10,2),
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    
    -- Platform Integration
    external_variant_id VARCHAR(200),
    
    -- Inventory
    inventory_count INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    
    -- Specs
    options JSONB DEFAULT '{}',  -- {color: "Red", size: "XL"}
    
    -- Image
    image_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    pros TEXT[],
    cons TEXT[],
    
    -- Review Media
    images TEXT[] DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
    rejection_reason TEXT,
    
    -- Helpful Votes
    helpful_count INTEGER DEFAULT 0,
    
    -- Metadata
    customer_name VARCHAR(100),
    verified_purchase BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create product_questions table (Q&A)
CREATE TABLE IF NOT EXISTS product_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    question TEXT NOT NULL,
    answer TEXT,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Orders Tables
-- ============================================================================

-- Create orders table (Enhanced with fulfillment)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer Info
    customer_id UUID REFERENCES customers(id),
    guest_email VARCHAR(255),
    
    -- Order Info
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Pricing
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Addresses
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned')),
    payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    fulfillment_status VARCHAR(30) DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'processing', 'shipped', 'delivered')),
    
    -- Payment Info
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    transaction_id VARCHAR(255),
    
    -- Fulfillment (Dropshipping)
    source_platform VARCHAR(50),
    external_order_id VARCHAR(200),
    external_order_url TEXT,
    warehouse_id UUID REFERENCES warehouses(id),
    
    -- Shipping
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(200),
    tracking_url TEXT,
    carrier VARCHAR(100),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    -- Coupon Used
    coupon_id UUID,
    coupon_code VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    
    -- Item Info
    name VARCHAR(500) NOT NULL,
    sku VARCHAR(200),
    image_url TEXT,
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Platform Integration
    external_variant_id VARCHAR(200),
    
    -- Fulfillment
    fulfillment_status VARCHAR(30) DEFAULT 'unfulfilled',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping_tracking table
CREATE TABLE IF NOT EXISTS shipping_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    tracking_number VARCHAR(200) NOT NULL,
    carrier VARCHAR(100) NOT NULL,
    tracking_url TEXT,
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned')),
    
    estimated_delivery DATE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    
    events JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Cart & Sessions
-- ============================================================================

-- Create shopping_cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_add DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- ============================================================================
-- Marketing & Communication
-- ============================================================================

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    is_subscribed BOOLEAN DEFAULT true,
    source VARCHAR(50) DEFAULT 'website',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'push')),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication_logs table
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    customer_id UUID REFERENCES customers(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'push', 'whatsapp')),
    template_id UUID REFERENCES notification_templates(id),
    subject TEXT,
    content TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    external_id VARCHAR(200),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Coupons & Discounts
-- ============================================================================

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('percentage', 'fixed', 'shipping')),
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_limit_per_customer INTEGER,
    usage_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    applies_to VARCHAR(50) DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_products', 'specific_categories')),
    product_ids UUID[] DEFAULT '{}',
    category_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Payment & Transactions
-- ============================================================================

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    customer_id UUID REFERENCES customers(id),
    transaction_id VARCHAR(255) UNIQUE,
    parent_transaction_id UUID REFERENCES payment_transactions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled')),
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    gateway_response JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Platform Credentials (Secure Storage)
-- ============================================================================

-- Create platform_credentials table
CREATE TABLE IF NOT EXISTS platform_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_name VARCHAR(50) NOT NULL CHECK (platform_name IN ('zendrop', 'cj', 'appscenic')),
    environment VARCHAR(20) DEFAULT 'production' CHECK (environment IN ('sandbox', 'production')),
    
    -- Encrypted credentials
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    
    -- Metadata
    webhook_url TEXT,
    webhook_secret TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(30) DEFAULT 'idle',
    sync_error TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform_name, environment)
);

-- ============================================================================
-- Settings & Configurations
-- ============================================================================

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
    group_name VARCHAR(50) DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_source_platform ON products(source_platform);
CREATE INDEX idx_products_external_product_id ON products(external_product_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_active = true;
CREATE INDEX idx_products_is_bestseller ON products(is_bestseller) WHERE is_active = true;

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_external_variant_id ON product_variants(external_variant_id);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX idx_product_reviews_status ON product_reviews(status);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_external_order_id ON orders(external_order_id);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_shipping_tracking_order_id ON shipping_tracking(order_id);
CREATE INDEX idx_shipping_tracking_tracking_number ON shipping_tracking(tracking_number);
CREATE INDEX idx_shipping_tracking_carrier ON shipping_tracking(carrier);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);

CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

CREATE INDEX idx_warehouses_supplier_id ON warehouses(supplier_id);
CREATE INDEX idx_warehouses_country ON warehouses(country);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

CREATE INDEX idx_shopping_cart_session_id ON shopping_cart(session_id);
CREATE INDEX idx_shopping_cart_user_id ON shopping_cart(user_id);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate average rating for product
CREATE OR REPLACE FUNCTION calculate_product_average_rating(product_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT AVG(rating)::DECIMAL(3,2) INTO avg_rating
    FROM product_reviews
    WHERE product_id = calculate_product_average_rating.product_id
    AND status = 'approved';
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ language plpgsql;

-- Function to update order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    order_count BIGINT;
    order_number VARCHAR(50);
BEGIN
    SELECT COUNT(*) + 1 INTO order_count FROM orders;
    order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(order_count::TEXT, 6, '0');
    RETURN order_number;
END;
$$ language plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customers (id, email, first_name, last_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Product images policies
CREATE POLICY "Product images are viewable by everyone" ON product_images
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage product images" ON product_images
    FOR ALL USING (auth.role() = 'authenticated');

-- Product variants policies
CREATE POLICY "Product variants are viewable by everyone" ON product_variants
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage product variants" ON product_variants
    FOR ALL USING (auth.role() = 'authenticated');

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Product reviews policies
CREATE POLICY "Approved reviews are viewable by everyone" ON product_reviews
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Customers can view own reviews" ON product_reviews
    FOR SELECT USING (customer_id = auth.uid() OR status = 'approved');

CREATE POLICY "Customers can create reviews" ON product_reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Customers can update own reviews" ON product_reviews
    FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Admins can manage reviews" ON product_reviews
    FOR ALL USING (auth.role() = 'authenticated');

-- Customers policies
CREATE POLICY "Customers can view own profile" ON customers
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Customers can update own profile" ON customers
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage customers" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Order items policies
CREATE POLICY "Customers can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Admins can manage order items" ON order_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Shopping cart policies
CREATE POLICY "Users can manage own cart" ON shopping_cart
    FOR ALL USING (user_id = auth.uid() OR session_id = current_setting('app.session_id', true));

CREATE POLICY "Admins can manage carts" ON shopping_cart
    FOR ALL USING (auth.role() = 'authenticated');

-- Wishlists policies
CREATE POLICY "Users can manage own wishlist" ON wishlists
    FOR ALL USING (customer_id = auth.uid());

-- Suppliers policies
CREATE POLICY "Suppliers are viewable by everyone" ON suppliers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage suppliers" ON suppliers
    FOR ALL USING (auth.role() = 'authenticated');

-- Warehouses policies
CREATE POLICY "Warehouses are viewable by everyone" ON warehouses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage warehouses" ON warehouses
    FOR ALL USING (auth.role() = 'authenticated');

-- Shipping tracking policies
CREATE POLICY "Customers can view own tracking" ON shipping_tracking
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = shipping_tracking.order_id AND orders.customer_id = auth.uid())
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Admins can manage tracking" ON shipping_tracking
    FOR ALL USING (auth.role() = 'authenticated');

-- Coupons policies
CREATE POLICY "Active coupons are viewable by everyone" ON coupons
    FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL USING (auth.role() = 'authenticated');

-- Payment transactions policies
CREATE POLICY "Customers can view own transactions" ON payment_transactions
    FOR SELECT USING (
        customer_id = auth.uid()
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Admins can manage transactions" ON payment_transactions
    FOR ALL USING (auth.role() = 'authenticated');

-- Platform credentials (Admins only)
CREATE POLICY "Admins can view own platform credentials" ON platform_credentials
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage platform credentials" ON platform_credentials
    FOR ALL USING (auth.role() = 'authenticated');

-- Settings (Admins only)
CREATE POLICY "Admins can view settings" ON settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Notifications
CREATE POLICY "Admins can manage notifications" ON notification_templates
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view communication logs" ON communication_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Newsletters (Public subscribe, Admin manage)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletters
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Newsletters are viewable by authenticated" ON newsletters
    FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- Seed Data
-- ============================================================================

-- Insert default admin user (password: admin123456)
INSERT INTO admin_users (email, password_hash, first_name, last_name, role) 
VALUES ('admin@luxuryhub.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, slug, description, image_url) VALUES 
('Electronics', 'electronics', 'Electronic devices and gadgets', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800'),
('Accessories', 'accessories', 'Fashion and lifestyle accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
('Home & Garden', 'home-garden', 'Home and living products', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'),
('Fitness & Sports', 'fitness-sports', 'Fitness and wellness products', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'),
('Beauty & Personal Care', 'beauty-personal-care', 'Beauty and personal care products', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800'),
('Kids & Babies', 'kids-babies', 'Products for kids and babies', 'https://images.unsplash.com/photo-1515488042361-25626be2f3be?w=800'),
('Pet Supplies', 'pet-supplies', 'Supplies for your pets', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'),
('Automotive', 'automotive', 'Automotive accessories and parts', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample high-margin products (placeholder - should be imported from platforms)
INSERT INTO products (name, slug, description, short_description, price, compare_price, category_id, cost_price, profit_margin, is_active, is_featured, images) 
SELECT 
    'Premium Wireless Headphones',
    'premium-wireless-headphones',
    'High-quality wireless headphones with noise cancellation technology. Features 30-hour battery life, premium sound quality, and comfortable over-ear design.',
    'Noise-cancelling wireless headphones with 30-hour battery life',
    79.99,
    129.99,
    (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1),
    25.00,
    68.75,
    true,
    true,
    ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800']
FROM categories WHERE slug = 'electronics'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, category_id, cost_price, profit_margin, is_active, is_featured, images)
SELECT 
    'Smart Fitness Watch',
    'smart-fitness-watch',
    'Advanced fitness tracking watch with heart rate monitoring, GPS, and sleep tracking. Water resistant up to 50m.',
    'Advanced fitness tracker with GPS and heart rate',
    149.99,
    249.99,
    (SELECT id FROM categories WHERE slug = 'fitness-sports' LIMIT 1),
    45.00,
    70.00,
    true,
    true,
    ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800']
FROM categories WHERE slug = 'fitness-sports'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- End of Schema
-- ============================================================================
