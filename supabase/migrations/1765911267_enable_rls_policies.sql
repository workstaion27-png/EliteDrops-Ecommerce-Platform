-- Migration: enable_rls_policies
-- Created at: 1765911267


-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access products" ON products FOR ALL USING (auth.role() = 'service_role');

-- Customers: Users can manage own profile
CREATE POLICY "Users can view own customer profile" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own customer profile" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customer profile" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access customers" ON customers FOR ALL USING (auth.role() = 'service_role');

-- Orders: Users can view own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Service role full access orders" ON orders FOR ALL USING (auth.role() = 'service_role');

-- Order items: Users can view items from own orders
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Service role full access order_items" ON order_items FOR ALL USING (auth.role() = 'service_role');

-- Cart items: Users can manage own cart
CREATE POLICY "Anyone can manage cart by session" ON cart_items FOR ALL USING (true);
;