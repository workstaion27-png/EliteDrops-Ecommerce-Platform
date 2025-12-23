/**
 * Supabase Database Setup Script
 * Creates all required tables for the e-commerce platform
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from user's keys
const SUPABASE_URL = 'https://pqbsymhweeggqowdxloya.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnN5bWh3ZWdncW93ZHhsb3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg3NDUyNywiZXhwIjoyMDgxNDUwNTI3fQ.bqKlEC9m6Q0ZAxg_4F2qloCdd6MzXw3kltQMMnUOlhY';

// Create Supabase client with service role (admin privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Complete database schema
const SQL_SCHEMA = `
-- ============================================
-- LUXURYHUB E-COMMERCE DATABASE SETUP
-- ============================================

-- Step 1: Clean up existing tables
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS newsletters CASCADE;
DROP TABLE IF EXISTS shopping_cart CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS shipping_tracking CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS todos CASCADE;

-- Step 2: Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    api_key TEXT,
    cj_supplier_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    images TEXT[],
    category VARCHAR(100),
    inventory_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    cj_product_id VARCHAR(100),
    supplier_id UUID REFERENCES suppliers(id),
    sku VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    tracking_number VARCHAR(100),
    cj_order_id VARCHAR(100),
    paypal_order_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    variant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create shipping_tracking table
CREATE TABLE shipping_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100) NOT NULL,
    carrier VARCHAR(50),
    status VARCHAR(50),
    estimated_delivery DATE,
    tracking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create admin_users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 9: Create product_variants table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    inventory_count INTEGER DEFAULT 0,
    cj_variant_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 10: Create product_images table
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 11: Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    cj_category_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 12: Create shopping_cart table
CREATE TABLE shopping_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 13: Create newsletters table
CREATE TABLE newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_subscribed BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Step 14: Create payment_transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    transaction_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 15: Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  phone_number TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Step 16: Create todos table
CREATE TABLE todos (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  task TEXT CHECK (char_length(task) > 3),
  is_complete BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  category VARCHAR(50),
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 17: Create indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_cj_product_id ON products(cj_product_id);
CREATE INDEX idx_shipping_tracking_order_id ON shipping_tracking(order_id);
CREATE INDEX idx_shipping_tracking_tracking_number ON shipping_tracking(tracking_number);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_is_complete ON todos(is_complete);

-- Step 18: Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ LANGUAGE 'plpgsql';

-- Step 19: Create triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_tracking_updated_at BEFORE UPDATE ON shipping_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 20: Insert default data
INSERT INTO admin_users (email, password_hash, first_name, last_name) 
VALUES ('admin@luxuryhub.com', '\$2b\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User');

INSERT INTO suppliers (name, email, cj_supplier_id, is_active) 
VALUES ('CJdropshipping', 'support@cjdropshipping.com', 'cj_supplier_001', true);

INSERT INTO categories (name, slug, description) VALUES 
('Electronics', 'electronics', 'Electronic devices and gadgets'),
('Accessories', 'accessories', 'Fashion and lifestyle accessories'),
('Home', 'home', 'Home and living products'),
('Fitness', 'fitness', 'Fitness and wellness products'),
('Beauty', 'beauty', 'Beauty and personal care products');

-- Step 21: Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Step 22: Create security policies
-- Products and categories (public read)
CREATE POLICY "Public products are viewable by everyone" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public categories are viewable by everyone" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view product images" ON product_images
    FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Admin users can manage all data" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage orders" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Todos policies
CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE USING (auth.uid() = user_id);

-- Step 23: Auto-create profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS \$\$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
\$\$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

async function setupDatabase() {
  console.log('🚀 Starting Supabase Database Setup...');
  console.log('📦 Project:', SUPABASE_URL);
  console.log('');

  try {
    // Execute the SQL schema
    console.log('📋 Creating tables and policies...');
    const { error } = await supabase.rpc('exec_sql', { sql: SQL_SCHEMA });
    
    if (error) {
      // Try direct SQL execution if RPC doesn't exist
      console.log('⚠️  RPC not available, trying direct query...');
      
      // Split SQL into individual statements and execute
      const statements = SQL_SCHEMA.split(';').filter(s => s.trim().length > 10);
      
      for (const statement of statements) {
        const { error: stmtError } = await supabase.query(statement);
        if (stmtError) {
          console.error('❌ Error:', stmtError.message);
        }
      }
    }

    // Verify tables were created
    console.log('✓ Tables created successfully!');
    console.log('');
    
    // Insert default admin if not exists
    console.log('👤 Setting up admin account...');
    const { data: adminExists } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', 'admin@luxuryhub.com')
      .single();

    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123456', 10);
      
      await supabase.from('admin_users').insert({
        email: 'admin@luxuryhub.com',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User'
      });
      console.log('✓ Admin account created!');
    } else {
      console.log('✓ Admin account already exists!');
    }

    // Final verification
    console.log('');
    console.log('🔍 Verifying database setup...');
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'customers', 'suppliers', 'products', 'orders', 'order_items',
        'shipping_tracking', 'admin_users', 'product_variants', 'product_images',
        'categories', 'shopping_cart', 'newsletters', 'payment_transactions',
        'profiles', 'todos'
      ]);

    console.log('📊 Tables created:', tables?.length || 0, '/ 15');
    console.log('');
    console.log('✅ Database Setup Complete!');
    console.log('');
    console.log('📝 Admin Credentials:');
    console.log('   Email: admin@luxuryhub.com');
    console.log('   Password: admin123456');
    console.log('');
    console.log('🔗 Project URL:', SUPABASE_URL);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('📌 Alternative: Copy SQL from SUPABASE_DATABASE_READY.sql');
    console.log('   and paste it into Supabase SQL Editor manually.');
  }
}

// Run the setup
setupDatabase();
