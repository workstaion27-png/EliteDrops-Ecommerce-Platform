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
CREATE INDEX idx_cj_settings_active ON cj_dropshipping_settings(is_active);
CREATE INDEX idx_cj_settings_sync_status ON cj_dropshipping_settings(sync_status);

-- Enable RLS
ALTER TABLE cj_dropshipping_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view CJ settings" ON cj_dropshipping_settings FOR SELECT USING (true);
CREATE POLICY "Service role full access cj_dropshipping_settings" ON cj_dropshipping_settings FOR ALL USING (auth.role() = 'service_role');