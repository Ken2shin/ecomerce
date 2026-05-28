import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

/**
 * Create a Stripe checkout session for an order
 */
export async function createCheckoutSession({
  orderId,
  orderNumber,
  amount,
  currency,
  customerEmail,
  redirectUrl,
  lineItems,
}: {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  redirectUrl: string;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: orderId,
      line_items: lineItems,
      currency: currency.toLowerCase(),
      success_url: `${redirectUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: redirectUrl,
      metadata: {
        orderId,
        orderNumber,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Retrieve checkout session details
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Amount in cents
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Get supported currencies and their symbols
 */
export const SUPPORTED_CURRENCIES: Record<
  string,
  { name: string; symbol: string }
> = {
  usd: { name: 'US Dollar', symbol: '$' },
  eur: { name: 'Euro', symbol: '€' },
  gbp: { name: 'British Pound', symbol: '£' },
  mxn: { name: 'Mexican Peso', symbol: '$' },
  cop: { name: 'Colombian Peso', symbol: '$' },
  ars: { name: 'Argentine Peso', symbol: '$' },
  brl: { name: 'Brazilian Real', symbol: 'R$' },
};
