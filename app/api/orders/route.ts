import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { createOrder, getUserOrders, getAllOrders } from '@/lib/orders';
import { CreateOrderSchema } from '@/lib/schemas';
import { supabase } from '@/lib/supabase';

// GET: Get user orders or all orders (admin)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let result;
    if (await isAdmin(user.id)) {
      // Admin can view all orders
      // Corrección del error de tipado: convertimos null a undefined explícitamente
      const status = searchParams.get('status') ?? undefined;
      result = await getAllOrders(status, limit, offset);
    } else {
      // Users can only view their own
      result = await getUserOrders(user.id, limit, offset);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// POST: Create new order
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = CreateOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const {
      shipping_address,
      billing_address,
      notes,
      currency,
    } = validation.data;

    // Get cart items
    const sessionId = request.cookies.get('session_id')?.value;
    let cartQuery = supabase.from('carts').select('items');

    if (user) {
      cartQuery = cartQuery.eq('user_id', user.id);
    } else if (sessionId) {
      cartQuery = cartQuery.eq('session_id', sessionId);
    }

    const { data: cart, error: cartError } = await cartQuery.single();

    if (cartError || !cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const { data: product } = await supabase
        .from('products')
        .select('id, price, discount_price, stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        // Use discount_price if available, otherwise use price
        const itemPrice = product.discount_price ? Number(product.discount_price) : Number(product.price);
        
        // Check stock availability
        if (!product.stock_quantity || product.stock_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for product ${item.product_id}` },
            { status: 400 }
          );
        }

        const itemSubtotal = itemPrice * item.quantity;
        subtotal += itemSubtotal;
        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: itemPrice,
        });
      }
    }

    // Calculate tax (15% IVA for Nicaragua) and shipping (180 Córdobas)
    const taxAmount = subtotal * 0.15;
    const shippingCost = 180;

    // Create order
    // Corrección del error de tipado: aplicamos `?? undefined` para garantizar compatibilidad estricta
    const order = await createOrder(user.id, {
      shippingAddress: shipping_address ?? undefined,
      billingAddress: billing_address ?? undefined,
      notes: notes ?? undefined,
      currency: currency ?? 'NIO',
      items: orderItems,
      subtotal,
      taxAmount,
      shippingCost,
      discountAmount: 0,
      cartItems: cart.items,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}