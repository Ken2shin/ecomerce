import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrderById } from '@/lib/orders';
import { createCheckoutSession } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

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
    const { orderId, currency } = body;

    if (!orderId || !currency) {
      return NextResponse.json(
        { error: 'Order ID and currency are required' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await getOrderById(orderId, user.id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get order items with product details
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(
        `
        *,
        product:product_id (name, images)
        `
      )
      .eq('order_id', orderId);

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      orderItems.map((item: any) => ({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.product.name,
            images: item.product.images,
          },
          unit_amount: Math.round(item.unit_price * 100), // Amount in cents
        },
        quantity: item.quantity,
      }));

    // Add shipping cost
    if (order.shipping_cost > 0) {
      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Shipping Cost',
          },
          unit_amount: Math.round(order.shipping_cost * 100),
        },
        quantity: 1,
      });
    }

    // Add tax if applicable
    if (order.tax_amount > 0) {
      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Sales Tax',
          },
          unit_amount: Math.round(order.tax_amount * 100),
        },
        quantity: 1,
      });
    }

    const redirectUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.total_amount,
      currency,
      customerEmail: user.email,
      redirectUrl: `${redirectUrl}/checkout/success`,
      lineItems,
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        url: session.url,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
