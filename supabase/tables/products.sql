CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cj_product_id TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    images TEXT[],
    category TEXT,
    variants JSONB,
    inventory_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);