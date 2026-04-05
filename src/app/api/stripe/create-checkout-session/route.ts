import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;

export async function POST(request: NextRequest) {
  try {
    if (!secretKey) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not configured' }, { status: 500 });
    }

    if (!priceId) {
      return NextResponse.json({ error: 'STRIPE_PRICE_ID is not configured' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);
    const { origin } = await request.json().catch(() => ({ origin: '' }));

    const appOrigin =
      typeof origin === 'string' && origin.startsWith('http')
        ? origin
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8081';

    const successUrl = `${appOrigin}/?ff_paid=1`;
    const cancelUrl = `${appOrigin}/?ff_paywall=1`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      metadata: {
        feature: 'fact-feed-unlimited',
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'No checkout URL returned by Stripe' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[StripeCheckout] Error creating session:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create Stripe checkout session' },
      { status: 500 }
    );
  }
}
