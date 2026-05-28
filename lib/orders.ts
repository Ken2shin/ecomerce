import { supabase, supabaseAdmin } from './supabase';
import { Order, OrderItem } from '@/types/database';

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

/**
 * Create order
 */
export async function createOrder(
  userId: string,
  {
    shippingAddress,
    billingAddress,
    notes,
    currency,
    items,
    subtotal,
    taxAmount,
    shippingCost,
    discountAmount,
    cartItems,
  }: {
    shippingAddress: any;
    billingAddress?: any;
    notes?: string;
    currency: string;
    items: { product_id: string; quantity: number; unit_price: number }[];
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    discountAmount?: number;
    cartItems?: any[];
  }
) {
  try {
    const orderNumber = generateOrderNumber();
    const totalAmount =
      subtotal + taxAmount + shippingCost - (discountAmount || 0);

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        total_amount: totalAmount,
        currency,
        subtotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        discount_amount: discountAmount || 0,
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError || !order) throw orderError;

    // Create order items and reduce stock
    const orderItemsData = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // Reduce stock for each product
    for (const item of items) {
      const { data: product, error: fetchError } = await supabaseAdmin
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (!fetchError && product) {
        const newStock = (product.stock_quantity || 0) - item.quantity;
        await supabaseAdmin
          .from('products')
          .update({ stock_quantity: Math.max(0, newStock) })
          .eq('id', item.product_id);
      }
    }

    return order as Order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Get user orders
 */
export async function getUserOrders(
  userId: string,
  limit = 20,
  offset = 0
) {
  try {
    const { data, error, count } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          subtotal
        )
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data as any[],
      count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string, userId?: string) {
  try {
    let query = supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          subtotal,
          product:product_id (name, image)
        )
        `
      )
      .eq('id', orderId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      throw new Error('Order not found');
    }

    return data as any;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Get all orders (Admin)
 */
export async function getAllOrders(
  status?: string,
  limit = 20,
  offset = 0
) {
  try {
    let query = supabase
      .from('orders')
      .select(
        `
        *,
        user:user_id (id, email, full_name)
        `,
        { count: 'exact' }
      );

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data as any[],
      count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Update order status (Admin)
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  trackingNumber?: string
) {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error || !data) throw error;

    return data as Order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string, userId: string) {
  try {
    // Check if order belongs to user and hasn't been shipped yet
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !order) {
      throw new Error('Order not found');
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      throw new Error('Cannot cancel shipped or delivered orders');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error || !data) throw error;

    return data as Order;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
}
