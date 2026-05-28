import { NextRequest, NextResponse } from 'next/server';
import { stripe, verifyWebhookSignature } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { clearCart } from '@/lib/cart';
import Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    if (!WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, WEBHOOK_SECRET);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === 'paid') {
          const orderId = session.client_reference_id;

          if (orderId) {
            // Update order status to processing
            await supabaseAdmin
              .from('orders')
              .update({
                status: 'processing',
                updated_at: new Date().toISOString(),
              })
              .eq('id', orderId);

            // Clear user's cart after successful payment
            const { data: cart } = await supabaseAdmin
              .from('carts')
              .select('id')
              .eq('user_id', session.client_reference_id)
              .single();

            if (cart) {
              await clearCart(cart.id);
            }

            console.log(
              `[v0] Payment successful for order ${orderId}`
            );
          }
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.client_reference_id;

        if (orderId) {
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'processing',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          console.log(
            `[v0] Async payment succeeded for order ${orderId}`
          );
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.client_reference_id;

        if (orderId) {
          await supabaseAdmin
            .from('orders')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          console.log(
            `[v0] Async payment failed for order ${orderId}`
          );
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        // Find order by payment intent
        if (charge.payment_intent) {
          const { data: orders } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('id', charge.payment_intent as string)
            .limit(1);

          if (orders && orders.length > 0) {
            // Update order status if needed
            console.log(
              `[v0] Charge refunded for order ${orders[0].id}`
            );
          }
        }
        break;
      }

      default:
        console.log(
          `[v0] Unhandled webhook event type: ${event.type}`
        );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    console.error('Webhook error:', message);
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
