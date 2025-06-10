import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    const { priceId, trigger, trialData, userEmail, userId } = await request.json();

    // Track conversion attempt
    console.log('Checkout session requested:', {
      trigger,
      trialData,
      timestamp: new Date().toISOString()
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}&upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/settings?upgrade=cancelled`,
      customer_email: userEmail,
      metadata: {
        userId: userId || 'anonymous',
        trigger: trigger || 'unknown',
        trialDaysRemaining: trialData?.daysRemaining?.toString() || '0',
        trialMessagesUsed: trialData?.messagesUsed?.toString() || '0',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      subscription_data: {
        metadata: {
          userId: userId || 'anonymous',
          upgradeSource: trigger || 'unknown',
          trialConversionDate: new Date().toISOString(),
        }
      },
      // Add trial period if needed
      ...(process.env.NODE_ENV === 'development' && {
        payment_method_collection: 'if_required',
      }),
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Stripe checkout session error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create checkout session',
        code: error.code || 'checkout_error'
      }, 
      { status: 500 }
    );
  }
}

// GET method to retrieve session details
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' }, 
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        subscription_id: session.subscription?.id,
        customer_id: session.customer?.id,
      }
    });

  } catch (error) {
    console.error('Stripe session retrieval error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve session' }, 
      { status: 500 }
    );
  }
}