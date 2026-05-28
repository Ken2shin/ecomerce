// Database Types for Rich Shakes E-Commerce Platform

export type User = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin' | 'support';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  discount_price: number | null;
  currency: string;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  specifications: Record<string, any>;
  rating_avg?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  user?: { full_name: string; avatar_url: string | null };
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  shipping_address: Address;
  billing_address: Address;
  notes: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
};

export type Address = {
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
};

export type Cart = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  items: CartItem[];
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
};

export type SupportTicket = {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type SupportReply = {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  attachments: string[] | null;
  created_at: string;
  user?: { full_name: string; avatar_url: string | null };
};

export type Currency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_active: boolean;
  updated_at: string;
};

export type AdminAuditLog = {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
};
