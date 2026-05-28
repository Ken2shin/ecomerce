import { z } from 'zod';

// Authentication schemas
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const UpdatePasswordSchema = z.object({
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// User profile schema
export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
});

// Product schemas
export const CreateProductSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().min(5, 'Short description must be at least 5 characters'),
  price: z.number().positive('Price must be positive'),
  discount_price: z.number().positive().optional().nullable(),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  stock_quantity: z.number().nonnegative('Stock quantity must be non-negative'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  images: z.array(z.string().url('Invalid image URL')).default([]),
  specifications: z.record(z.any()).optional().default({}),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// Category schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(3, 'Category name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  icon_url: z.string().url('Invalid icon URL').optional().nullable(),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

// Review schemas
export const CreateReviewSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

export const UpdateReviewSchema = CreateReviewSchema.partial();

// Order schemas
export const AddressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  street_address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state_province: z.string().min(2, 'State/Province is required'),
  postal_code: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export const CreateOrderSchema = z.object({
  shipping_address: AddressSchema,
  billing_address: AddressSchema.optional(),
  notes: z.string().optional().nullable(),
  currency: z.string().length(3, 'Currency must be 3 characters'),
});

// Support ticket schemas
export const CreateSupportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  order_id: z.string().uuid('Invalid order ID').optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const UpdateSupportTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigned_to: z.string().uuid('Invalid user ID').optional().nullable(),
});

export const AddSupportReplySchema = z.object({
  message: z.string().min(5, 'Message must be at least 5 characters'),
  attachments: z.array(z.string().url('Invalid attachment URL')).optional(),
});

// Cart schemas
export const AddToCartSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().positive('Quantity must be positive'),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().positive('Quantity must be positive'),
});

// Stripe schemas
export const StripeCheckoutSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  amount: z.number().positive('Amount must be positive'),
  redirect_url: z.string().url('Invalid redirect URL'),
});

// Export types
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type CreateSupportTicketInput = z.infer<typeof CreateSupportTicketSchema>;
export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type Address = z.infer<typeof AddressSchema>;
