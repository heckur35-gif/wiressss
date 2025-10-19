-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_credentials ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Products are public for read" ON products
  FOR SELECT USING (true);

CREATE POLICY "Only owner can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM owner_credentials WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only owner can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM owner_credentials WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only owner can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM owner_credentials WHERE user_id = auth.uid()
    )
  );

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM owner_credentials WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM owner_credentials WHERE user_id = auth.uid()
  ));

-- Inquiries policies
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM owner_credentials WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Only owner can update inquiries" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM owner_credentials WHERE user_id = auth.uid()
    )
  );

-- Carts policies
CREATE POLICY "Users can view own cart" ON carts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cart" ON carts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cart" ON carts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cart" ON carts
  FOR DELETE USING (user_id = auth.uid());

-- Owner credentials policies
CREATE POLICY "Only owner can view credentials" ON owner_credentials
  FOR SELECT USING (user_id = auth.uid());
