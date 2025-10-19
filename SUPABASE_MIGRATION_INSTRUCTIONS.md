# Supabase Migration Instructions

## How to Set Up Supabase Database

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `duhsvsskqceltccieysz`
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the SQL below and execute

## Migration 1: Create Tables

```sql
-- Create users table linked to auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE,
  full_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_pincode TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_method TEXT DEFAULT 'qr_code',
  qr_code_data TEXT,
  transaction_id TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  product_name TEXT,
  brand TEXT,
  color TEXT,
  quantity INTEGER,
  unit TEXT,
  specifications JSONB,
  verification_code TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create owner_credentials table
CREATE TABLE IF NOT EXISTS owner_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## Migration 2: Enable Row Level Security (RLS)

```sql
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

CREATE POLICY "Allow insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

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
```

## After Migration: Add Owner Credentials

To allow a user to be an owner, add their user ID to the owner_credentials table:

```sql
-- Replace 'user-id-here' with the actual user ID from auth.users table
INSERT INTO owner_credentials (user_id) 
VALUES ('user-id-here')
ON CONFLICT DO NOTHING;
```

## Verification

After running the migrations:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Note the User ID of your owner account
3. Insert that User ID into owner_credentials table using the query above
4. Go to **Database** → **Tables** to verify all tables are created
5. Go to **Authentication** → **Providers** and enable **Phone** provider for OTP login

## Phone Authentication Setup

1. Go to **Authentication** → **Providers**
2. Click on **Phone** provider
3. Set **Twilio Credentials** (if you have Twilio account) OR use **Supabase's default SMS provider**
4. Enable the provider

Your Supabase is now ready to use!
