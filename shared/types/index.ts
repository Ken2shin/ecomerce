// User & Auth
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  password_hash: string;
  tenant_id: string;
  role: 'customer' | 'admin' | 'support';
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Session {
  userId: string;
  tenantId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Product
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  sku: string;
  category_id: string;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'discontinued';
  images: string[];
  rating: number;
  review_count: number;
  tenant_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  tenant_id: string;
  created_at: Date;
}

// Cart
export interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
  added_at: Date;
}

export interface Cart {
  user_id?: string;
  tenant_id: string;
  items: CartItem[];
  session_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Order
export interface Order {
  id: string;
  user_id: string;
  tenant_id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address: Address;
  billing_address?: Address;
  tracking_number?: string;
  payment_method: 'card' | 'bank_transfer' | 'wallet';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  product_name: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

// Review
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  tenant_id: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

// Support Ticket
export interface SupportTicket {
  id: string;
  user_id: string;
  tenant_id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'closed';
  category: string;
  messages: TicketMessage[];
  assigned_to?: string;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

export interface TicketMessage {
  id: string;
  author_id: string;
  author_type: 'customer' | 'support';
  message: string;
  attachments?: string[];
  created_at: Date;
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  description?: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise';
  settings: TenantSettings;
  created_at: Date;
  updated_at: Date;
}

export interface TenantSettings {
  currency: string;
  timezone: string;
  language: string;
  theme: Record<string, string>;
  payment_methods: string[];
  shipping_providers: string[];
  taxes_enabled: boolean;
  analytics_enabled: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
  timestamp: Date;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Request Context (Tenant + User info)
export interface RequestContext {
  tenantId: string;
  userId?: string;
  userRole?: string;
  sessionId?: string;
}
