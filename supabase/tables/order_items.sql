CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID,
    cj_product_id TEXT,
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    variant_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);