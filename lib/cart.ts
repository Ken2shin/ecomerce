import { supabase, supabaseAdmin } from './supabase';
import { Cart, CartItem } from '@/types/database';

/**
 * Get or create cart for user/session
 */
export async function getOrCreateCart(
  userId?: string,
  sessionId?: string
): Promise<Cart> {
  try {
    let query = supabase.from('carts').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: existingCart } = await query.single();

    if (existingCart) {
      return existingCart as Cart;
    }

    // Create new cart using admin client to bypass RLS
    const { data: newCart, error } = await supabaseAdmin
      .from('carts')
      .insert({
        user_id: userId || null,
        session_id: sessionId || null,
        items: [],
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    if (error) throw error;
    return newCart as Cart;
  } catch (error) {
    console.error('Error getting or creating cart:', error);
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  cartId: string,
  productId: string,
  quantity: number,
  price: number
) {
  try {
    const { data: cart, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('id', cartId)
      .single();

    if (fetchError) throw fetchError;

    const items = cart?.items || [];
    const existingItemIndex = items.findIndex(
      (item: CartItem) => item.product_id === productId
    );

    if (existingItemIndex > -1) {
      items[existingItemIndex].quantity += quantity;
    } else {
      items.push({
        id: `item-${Date.now()}`,
        product_id: productId,
        quantity,
        price,
      });
    }

    const { data: updatedCart, error: updateError } = await supabase
      .from('carts')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', cartId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedCart as Cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  cartId: string,
  itemId: string,
  quantity: number
) {
  try {
    const { data: cart, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('id', cartId)
      .single();

    if (fetchError) throw fetchError;

    const items = cart?.items || [];
    const itemIndex = items.findIndex((item: CartItem) => item.id === itemId);

    if (itemIndex === -1) {
      throw new Error('Cart item not found');
    }

    if (quantity <= 0) {
      items.splice(itemIndex, 1);
    } else {
      items[itemIndex].quantity = quantity;
    }

    const { data: updatedCart, error: updateError } = await supabase
      .from('carts')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', cartId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedCart as Cart;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartId: string, itemId: string) {
  try {
    const { data: cart, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('id', cartId)
      .single();

    if (fetchError) throw fetchError;

    const items = cart?.items?.filter((item: CartItem) => item.id !== itemId) || [];

    const { data: updatedCart, error: updateError } = await supabase
      .from('carts')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', cartId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedCart as Cart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Clear cart
 */
export async function clearCart(cartId: string) {
  try {
    const { data: updatedCart, error } = await supabase
      .from('carts')
      .update({ items: [], updated_at: new Date().toISOString() })
      .eq('id', cartId)
      .select()
      .single();

    if (error) throw error;
    return updatedCart as Cart;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}
