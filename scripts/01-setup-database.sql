-- Rich Shakes E-Commerce Platform - Database Schema
-- This script creates all necessary tables and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PgCrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE: public.users (Extended Supabase Auth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'support')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: public.categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- ============================================================================
-- TABLE: public.products
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  discount_price DECIMAL(10, 2) CHECK (discount_price IS NULL OR discount_price >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  sku VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  specifications JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);

-- ============================================================================
-- TABLE: public.product_reviews
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);

-- ============================================================================
-- TABLE: public.orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users ON DELETE RESTRICT,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  notes TEXT,
  tracking_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ============================================================================
-- TABLE: public.order_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ============================================================================
-- TABLE: public.carts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users ON DELETE CASCADE,
  session_id VARCHAR(255),
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON public.carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_expires_at ON public.carts(expires_at);

-- ============================================================================
-- TABLE: public.support_tickets
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users ON DELETE RESTRICT,
  order_id UUID REFERENCES public.orders ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES public.users ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);

-- ============================================================================
-- TABLE: public.support_replies
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.support_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users ON DELETE RESTRICT,
  message TEXT NOT NULL,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_replies_ticket_id ON public.support_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_replies_user_id ON public.support_replies(user_id);

-- ============================================================================
-- TABLE: public.currencies
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.currencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(3) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  exchange_rate DECIMAL(10, 6) NOT NULL DEFAULT 1.0 CHECK (exchange_rate > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_currencies_code ON public.currencies(code);
CREATE INDEX IF NOT EXISTS idx_currencies_is_active ON public.currencies(is_active);

-- ============================================================================
-- TABLE: public.admin_audit_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.users ON DELETE RESTRICT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity_type ON public.admin_audit_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admin can update any user profile" 
  ON public.users FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Categories table policies
CREATE POLICY "Anyone can read active categories" 
  ON public.categories FOR SELECT 
  USING (is_active = TRUE);

CREATE POLICY "Admin can manage categories" 
  ON public.categories FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Products table policies
CREATE POLICY "Anyone can read active products" 
  ON public.products FOR SELECT 
  USING (is_active = TRUE);

CREATE POLICY "Admin can manage products" 
  ON public.products FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Product reviews policies
CREATE POLICY "Anyone can read reviews" 
  ON public.product_reviews FOR SELECT 
  USING (TRUE);

CREATE POLICY "Users can create reviews" 
  ON public.product_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.product_reviews FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage reviews" 
  ON public.product_reviews FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Orders table policies
CREATE POLICY "Users can read their own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all orders" 
  ON public.orders FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can create their own orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update orders" 
  ON public.orders FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Order items policies
CREATE POLICY "Users can read their own order items" 
  ON public.order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admin can read all order items" 
  ON public.order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can create order items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (TRUE);

-- Carts table policies
CREATE POLICY "Users can manage their own cart" 
  ON public.carts FOR ALL 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Support tickets policies
CREATE POLICY "Users can read their own tickets" 
  ON public.support_tickets FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all tickets" 
  ON public.support_tickets FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'support')));

CREATE POLICY "Users can create tickets" 
  ON public.support_tickets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update tickets" 
  ON public.support_tickets FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'support')));

-- Support replies policies
CREATE POLICY "Users can read replies to their tickets" 
  ON public.support_replies FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE support_tickets.id = support_replies.ticket_id 
    AND support_tickets.user_id = auth.uid()
  ));

CREATE POLICY "Admin can read all replies" 
  ON public.support_replies FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'support')));

CREATE POLICY "Users and admins can add replies" 
  ON public.support_replies FOR INSERT 
  WITH CHECK (TRUE);

-- Currencies table policies
CREATE POLICY "Anyone can read active currencies" 
  ON public.currencies FOR SELECT 
  USING (is_active = TRUE);

CREATE POLICY "Admin can manage currencies" 
  ON public.currencies FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Admin audit log policies
CREATE POLICY "Only admin can read audit logs" 
  ON public.admin_audit_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can insert audit logs" 
  ON public.admin_audit_log FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default currencies
INSERT INTO public.currencies (code, name, symbol, exchange_rate, is_active)
VALUES 
  ('USD', 'United States Dollar', '$', 1.0, TRUE),
  ('EUR', 'Euro', '€', 0.92, TRUE),
  ('MXN', 'Mexican Peso', '$', 17.05, TRUE),
  ('COP', 'Colombian Peso', '$', 3900.0, TRUE),
  ('ARS', 'Argentine Peso', '$', 850.0, TRUE),
  ('BRL', 'Brazilian Real', 'R$', 5.15, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Insert categories
INSERT INTO public.categories (name, slug, description, display_order, is_active)
VALUES 
  ('Bebidas Frescas', 'bebidas-frescas', 'Batidos, malteadas y bebidas refrescantes', 1, TRUE),
  ('Bebidas Calientes', 'bebidas-calientes', 'Café, chocolate y bebidas calientes', 2, TRUE),
  ('Pasteles', 'pasteles', 'Pasteles y tortas artesanales', 3, TRUE),
  ('Postres', 'postres', 'Postres y helados', 4, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (
  category_id, name, slug, description, short_description, 
  price, currency, stock_quantity, sku, is_active, is_featured, images
)
SELECT 
  c.id, 'Batido de Fresa Premium', 'batido-fresa-premium', 
  'Delicioso batido hecho con fresas frescas, yogur y miel. Perfecto para el desayuno.',
  'Batido premium de fresa con frutas naturales',
  8.99, 'USD', 50, 'SKU-FRESA-001', TRUE, TRUE, 
  ARRAY['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-R2QIHfbrE5zdjvyX4NiAmtKxuU2Uxv.png']
FROM public.categories c WHERE c.slug = 'bebidas-frescas'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (
  category_id, name, slug, description, short_description, 
  price, discount_price, currency, stock_quantity, sku, is_active, is_featured, images
)
SELECT 
  c.id, 'Torta de Chocolate Deluxe', 'torta-chocolate-deluxe', 
  'Torta de chocolate de tres capas con relleno de crema y decoraciones artesanales.',
  'Torta de chocolate premium con detalles especiales',
  24.99, 19.99, 'USD', 30, 'SKU-CHOCO-001', TRUE, TRUE, 
  ARRAY['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-XqyLAPhBnS2NQw2P2w5RGVqHYB0DK5.png']
FROM public.categories c WHERE c.slug = 'pasteles'
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- FUNCTIONS FOR MAINTAINING DATA
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for categories table
CREATE TRIGGER trigger_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for products table
CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders table
CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for carts table
CREATE TRIGGER trigger_carts_updated_at
BEFORE UPDATE ON public.carts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for support_tickets table
CREATE TRIGGER trigger_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
  new_order_number VARCHAR;
BEGIN
  new_order_number := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || 
                     lpad(nextval('orders_seq')::text, 6, '0');
  RETURN new_order_number;
END;
$$ language 'plpgsql';

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS orders_seq START 1;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets for product images and avatars
-- Note: These need to be created through Supabase dashboard or admin API
-- Bucket 1: product-images (public)
-- Bucket 2: avatars (private)
-- Bucket 3: support-attachments (private)

-- Set policies for product-images bucket (public read)
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('product-images', 'product-images', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('avatars', 'avatars', false, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('support-attachments', 'support-attachments', false, NOW(), NOW())
ON CONFLICT DO NOTHING;
