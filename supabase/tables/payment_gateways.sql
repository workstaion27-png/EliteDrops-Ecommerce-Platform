-- Payment Gateways Table
CREATE TABLE payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('paypal', 'stripe', 'visa', 'mastercard', 'american_express')),
    api_key TEXT NOT NULL,
    secret_key TEXT,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CJ Dropshipping Settings Table
CREATE TABLE cj_dropshipping_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key TEXT,
    affiliate_id TEXT,
    is_active BOOLEAN DEFAULT false,
    auto_sync BOOLEAN DEFAULT false,
    sync_frequency TEXT DEFAULT 'daily' CHECK (sync_frequency IN ('hourly', 'daily', 'weekly')),
    auto_import_products BOOLEAN DEFAULT false,
    auto_update_inventory BOOLEAN DEFAULT false,
    auto_process_orders BOOLEAN DEFAULT false,
    webhook_url TEXT,
    last_sync TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error')),
    total_products INTEGER DEFAULT 0,
    imported_products INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_payment_gateways_type ON payment_gateways(type);
CREATE INDEX idx_payment_gateways_active ON payment_gateways(is_active);
CREATE INDEX idx_cj_settings_active ON cj_dropshipping_settings(is_active);
CREATE INDEX idx_cj_settings_sync_status ON cj_dropshipping_settings(sync_status);

-- Enable RLS
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE cj_dropshipping_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_gateways
CREATE POLICY "Anyone can view active payment gateways" ON payment_gateways FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access payment_gateways" ON payment_gateways FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for cj_dropshipping_settings
CREATE POLICY "Anyone can view CJ settings" ON cj_dropshipping_settings FOR SELECT USING (true);
CREATE POLICY "Service role full access cj_dropshipping_settings" ON cj_dropshipping_settings FOR ALL USING (auth.role() = 'service_role');

-- Insert default payment gateway settings
INSERT INTO payment_gateways (name, type, api_key, is_active, config) VALUES 
('PayPal Primary', 'paypal', '', true, '{"sandbox": true, "webhook_url": "/api/paypal/webhook"}'),
('Stripe Primary', 'stripe', '', false, '{"webhook_secret": "", "payment_methods": ["card", "paypal"]}');