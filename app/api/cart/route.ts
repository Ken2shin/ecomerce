import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import {
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '@/lib/cart';
import { AddToCartSchema, UpdateCartItemSchema } from '@/lib/schemas';

// GET: Get user cart
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.cookies.get('session_id')?.value;

    let cart;
    if (user) {
      cart = await getOrCreateCart(user.id);
    } else if (sessionId) {
      cart = await getOrCreateCart(undefined, sessionId);
    } else {
      // Create new session for guest
      const newSessionId = `guest-${Date.now()}`;
      cart = await getOrCreateCart(undefined, newSessionId);

      const response = NextResponse.json(cart, { status: 200 });
      response.cookies.set('session_id', newSessionId, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    console.error('[v0] Cart error:', error);
    // Return empty cart instead of 500 to allow app to continue working
    return NextResponse.json({ 
      id: `cart-${Date.now()}`, 
      items: [], 
      total: 0,
      error: 'Supabase not configured. Using mock cart.' 
    }, { status: 200 });
  }
}

// POST: Add item to cart or clear cart
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.cookies.get('session_id')?.value;

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: 'Cart session not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'clear') {
      // Clear cart
      const cart = await getOrCreateCart(
        user?.id,
        sessionId
      );
      const clearedCart = await clearCart(cart.id);
      return NextResponse.json(clearedCart, { status: 200 });
    }

    // Add to cart
    const validation = AddToCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { product_id, quantity } = validation.data;

    // Get product to get current price
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, price')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const cart = await getOrCreateCart(user?.id, sessionId);
    const updatedCart = await addToCart(
      cart.id,
      product_id,
      quantity,
      product.price
    );

    return NextResponse.json(updatedCart, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add to cart';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

// PUT: Update cart item
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.cookies.get('session_id')?.value;

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: 'Cart session not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { item_id, quantity } = body;

    const validation = UpdateCartItemSchema.safeParse({ quantity });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(user?.id, sessionId);
    const updatedCart = await updateCartItem(cart.id, item_id, quantity);

    return NextResponse.json(updatedCart, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update cart';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

// DELETE: Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.cookies.get('session_id')?.value;

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: 'Cart session not found' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(user?.id, sessionId);
    const updatedCart = await removeFromCart(cart.id, itemId);

    return NextResponse.json(updatedCart, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove from cart';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
