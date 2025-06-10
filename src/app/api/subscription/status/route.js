import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    const subscriptionId = searchParams.get('subscription_id');
    
    if (!customerId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Customer ID or Subscription ID required' },
        { status: 400 }
      );
    }

    let subscription = null;
    
    if (subscriptionId) {
      // Get specific subscription
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    } else if (customerId) {
      // Get customer's active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });
      
      subscription = subscriptions.data[0] || null;
    }

    if (!subscription) {
      return NextResponse.json({
        status: 'inactive',
        plan: 'trial',
        hasActiveSubscription: false,
      });
    }

    const subscriptionStatus = {
      status: subscription.status,
      plan: subscription.status === 'active' ? 'premium' : 'trial',
      hasActiveSubscription: subscription.status === 'active',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      priceId: subscription.items.data[0]?.price?.id,
    };

    return NextResponse.json(subscriptionStatus);

  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve subscription status' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, subscriptionId, customerId } = await request.json();

    switch (action) {
      case 'cancel':
        if (!subscriptionId) {
          return NextResponse.json(
            { error: 'Subscription ID required for cancellation' },
            { status: 400 }
          );
        }

        const cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });

        return NextResponse.json({
          success: true,
          subscription: {
            id: cancelledSubscription.id,
            status: cancelledSubscription.status,
            cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
            currentPeriodEnd: new Date(cancelledSubscription.current_period_end * 1000),
          }
        });

      case 'reactivate':
        if (!subscriptionId) {
          return NextResponse.json(
            { error: 'Subscription ID required for reactivation' },
            { status: 400 }
          );
        }

        const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false
        });

        return NextResponse.json({
          success: true,
          subscription: {
            id: reactivatedSubscription.id,
            status: reactivatedSubscription.status,
            cancelAtPeriodEnd: reactivatedSubscription.cancel_at_period_end,
          }
        });

      case 'update_payment_method':
        // Create a setup intent for updating payment method
        const setupIntent = await stripe.setupIntents.create({
          customer: customerId,
          usage: 'off_session',
        });

        return NextResponse.json({
          success: true,
          client_secret: setupIntent.client_secret,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Subscription action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform subscription action' },
      { status: 500 }
    );
  }
}