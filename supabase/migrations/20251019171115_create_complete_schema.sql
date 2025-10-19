/*
  # Complete Schema Setup for WireBazaar

  ## 1. New Tables
  
  ### `users`
  - `id` (uuid, primary key) - User identifier from Supabase Auth
  - `email` (text) - User email
  - `phone_number` (text) - User phone number
  - `full_name` (text) - User full name
  - `address` (text) - User address
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `products`
  - `id` (uuid, primary key) - Product identifier
  - `name` (text) - Product name
  - `brand` (text) - Brand name
  - `category` (text) - Product category
  - `colors` (text[]) - Available colors
  - `description` (text) - Product description
  - `specifications` (jsonb) - Technical specifications
  - `base_price` (numeric) - Price per unit
  - `unit_type` (text) - Unit of measurement
  - `stock_quantity` (integer) - Available stock
  - `image_url` (text) - Product image URL
  - `brochure_url` (text) - Product brochure URL
  - `is_active` (boolean) - Product visibility status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `orders`
  - `id` (uuid, primary key) - Order identifier
  - `user_id` (uuid, nullable) - References users table
  - `order_number` (text) - Unique order number
  - `customer_name` (text) - Customer name
  - `customer_email` (text) - Customer email
  - `customer_phone` (text) - Customer phone
  - `customer_address` (text) - Delivery address
  - `customer_pincode` (text) - Delivery pincode
  - `items` (jsonb) - Order items array
  - `subtotal` (numeric) - Subtotal amount
  - `shipping_cost` (numeric) - Shipping cost
  - `total_amount` (numeric) - Total order amount
  - `status` (text) - Order status
  - `payment_status` (text) - Payment status
  - `payment_method` (text) - Payment method
  - `qr_code_data` (text) - QR code for payment
  - `transaction_id` (text) - Transaction reference
  - `estimated_delivery` (text) - Estimated delivery date
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `inquiries`
  - `id` (uuid, primary key) - Inquiry identifier
  - `user_type` (text) - Type of user (retail/business/contractor)
  - `full_name` (text) - Contact person name
  - `phone` (text) - Contact phone number
  - `email` (text) - Contact email
  - `address` (text) - Location address
  - `pincode` (text) - Location pincode
  - `product_name` (text) - Requested product
  - `brand` (text) - Preferred brand
  - `color` (text) - Preferred color
  - `quantity` (numeric) - Required quantity
  - `unit` (text) - Unit of measurement
  - `specifications` (jsonb) - Additional specifications
  - `verification_code` (text) - OTP code
  - `is_verified` (boolean) - Verification status
  - `status` (text) - Inquiry status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `owner_credentials`
  - `id` (uuid, primary key) - Credential identifier
  - `user_id` (uuid) - References Supabase auth.users
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `carts`
  - `id` (uuid, primary key) - Cart identifier
  - `user_id` (uuid) - References users table
  - `items` (jsonb) - Cart items array
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Anonymous users can read products
  - Authenticated users can manage their own data
  - Owners have special access through owner_credentials

  ## 3. Seed Data
  - Initial product catalog with 10 products
*/

-- ============ CREATE HELPER FUNCTION ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============ CREATE USERS TABLE ============
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone_number text,
  full_name text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============ CREATE PRODUCTS TABLE ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  colors text[] DEFAULT '{}',
  description text NOT NULL,
  specifications jsonb DEFAULT '{}',
  base_price numeric(10,2) NOT NULL,
  unit_type text NOT NULL,
  stock_quantity integer DEFAULT 0,
  image_url text NOT NULL,
  brochure_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ============ CREATE ORDERS TABLE ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  customer_pincode text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(10,2) NOT NULL,
  shipping_cost numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_method text NOT NULL,
  qr_code_data text,
  transaction_id text,
  estimated_delivery text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============ CREATE INQUIRIES TABLE ============
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  pincode text NOT NULL,
  product_name text NOT NULL,
  brand text NOT NULL,
  color text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  specifications jsonb DEFAULT '{}',
  verification_code text,
  is_verified boolean DEFAULT false,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert inquiries"
  ON inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============ CREATE OWNER CREDENTIALS TABLE ============
CREATE TABLE IF NOT EXISTS owner_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE owner_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own credentials"
  ON owner_credentials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============ CREATE CARTS TABLE ============
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============ CREATE TRIGGERS ============
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owner_credentials_updated_at
  BEFORE UPDATE ON owner_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============ SEED PRODUCTS ============
INSERT INTO products (name, brand, category, colors, description, specifications, base_price, unit_type, stock_quantity, image_url, brochure_url, is_active) VALUES
  ('FR PVC Insulated Wire 1.5 sq mm', 'Polycab', 'House Wires', ARRAY['Red', 'Blue', 'Yellow', 'Green', 'Black'], 'Flame retardant PVC insulated copper conductor wire suitable for domestic and commercial applications.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "FR PVC", "size": "1.5 sq mm", "standard": "IS 694:2010"}', 28.50, 'metres', 5000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', '/brochures/polycab-house-wire.pdf', true),
  ('FR PVC Insulated Wire 2.5 sq mm', 'Polycab', 'House Wires', ARRAY['Red', 'Blue', 'Yellow', 'Black'], 'Heavy duty flame retardant wire for higher load applications.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "FR PVC", "size": "2.5 sq mm", "standard": "IS 694:2010"}', 45.00, 'metres', 4000, 'https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg', null, true),
  ('HRFR Cable 4 sq mm', 'Havells', 'Building Wires', ARRAY['Red', 'Blue', 'Yellow', 'Green'], 'Heat resistant and flame retardant cable for industrial and residential use.', '{"voltage": "1100V", "conductor": "Electrolytic Copper", "insulation": "HRFR PVC", "size": "4 sq mm", "standard": "IS 694:2010"}', 68.00, 'metres', 3500, 'https://images.pexels.com/photos/163676/cannabis-hemp-plant-weed-163676.jpeg', null, true),
  ('Armoured LT Cable 3 Core 50 sq mm', 'KEI', 'Power Cables', ARRAY['Black'], 'Armoured low tension cable for underground and outdoor power distribution.', '{"voltage": "1.1 kV", "conductor": "Aluminium", "insulation": "XLPE", "size": "3 Core x 50 sq mm", "armour": "Galvanized Steel Wire"}', 425.00, 'metres', 2000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', null, true),
  ('Flexible Cable 0.75 sq mm', 'Finolex', 'Flexible Cables', ARRAY['Red', 'Blue', 'Yellow', 'White', 'Black'], 'Multi-strand flexible copper cable for appliances and electronics.', '{"voltage": "750V", "conductor": "Tinned Copper", "insulation": "PVC", "size": "0.75 sq mm", "strands": "24/0.20"}', 18.00, 'metres', 6000, 'https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg', null, true),
  ('FR Wire 6 sq mm', 'V-Guard', 'House Wires', ARRAY['Red', 'Blue', 'Yellow', 'Green', 'Black'], 'High quality flame retardant wire for heavy duty applications.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "FR PVC", "size": "6 sq mm", "standard": "IS 694:2010"}', 95.00, 'metres', 3000, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', null, true),
  ('Submersible Cable 3 Core 4 sq mm', 'RR Kabel', 'Submersible Cables', ARRAY['Black'], 'Water resistant cable designed for submersible pump applications.', '{"voltage": "1100V", "conductor": "Tinned Copper", "insulation": "PVC", "size": "3 Core x 4 sq mm", "sheath": "PVC"}', 85.00, 'metres', 2500, 'https://images.pexels.com/photos/163676/cannabis-hemp-plant-weed-163676.jpeg', null, true),
  ('Coaxial Cable RG6', 'Anchor', 'Communication Cables', ARRAY['White', 'Black'], 'High quality coaxial cable for TV, CCTV and broadband applications.', '{"type": "RG6", "impedance": "75 Ohm", "conductor": "Copper Clad Steel", "shielding": "Braided + Foil", "jacket": "PVC"}', 22.00, 'metres', 8000, 'https://images.pexels.com/photos/6419122/pexels-photo-6419122.jpeg', null, true),
  ('Control Cable 7 Core 1.5 sq mm', 'L&T', 'Control Cables', ARRAY['Grey'], 'Multi-core control cable for industrial automation and control panels.', '{"voltage": "1100V", "conductor": "Annealed Copper", "insulation": "PVC", "size": "7 Core x 1.5 sq mm", "sheath": "PVC"}', 72.00, 'metres', 1500, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg', null, true),
  ('Solar DC Cable 4 sq mm', 'Polycab', 'Solar Cables', ARRAY['Red', 'Black'], 'UV resistant cable specially designed for solar panel installations.', '{"voltage": "1500V DC", "conductor": "Tinned Copper", "insulation": "XLPO", "size": "4 sq mm", "temperature": "-40°C to +120°C"}', 58.00, 'metres', 4500, 'https://images.pexels.com/photos/163676/cannabis-hemp-plant-weed-163676.jpeg', null, true)
ON CONFLICT DO NOTHING;