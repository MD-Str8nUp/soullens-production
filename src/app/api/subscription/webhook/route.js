import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../../utils/supabase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);
  
  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Track conversion metrics
    const conversionData = {
      sessionId: session.id,
      customerId: session.customer,
      subscriptionId: session.subscription,
      userId: session.metadata?.userId,
      trigger: session.metadata?.trigger,
      trialDaysRemaining: session.metadata?.trialDaysRemaining,
      trialMessagesUsed: session.metadata?.trialMessagesUsed,
      conversionDate: new Date().toISOString(),
      amount: session.amount_total,
      currency: session.currency,
    };
    
    console.log('User upgraded to premium:', conversionData);
    
    // Here you would typically:
    // 1. Update user record in your database
    // 2. Send confirmation email
    // 3. Track analytics event
    // 4. Update user permissions
    
    // For now, we'll log the conversion
    await logConversion(conversionData);
    
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Update user subscription status
    const updateData = {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: 'active',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      lastPaymentDate: new Date(),
    };
    
    console.log('Subscription payment successful:', updateData);
    
    // Here you would update your database
    await updateSubscriptionStatus(updateData);
    
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  
  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Handle payment failure
    const failureData = {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      invoiceId: invoice.id,
      failureReason: invoice.last_finalization_error?.message,
      attemptCount: invoice.attempt_count,
    };
    
    console.log('Payment failed:', failureData);
    
    // Here you would:
    // 1. Update subscription status
    // 2. Send payment failure notification
    // 3. Handle dunning management
    
    await handlePaymentFailure(failureData);
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  const subscriptionData = {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    createdAt: new Date(subscription.created * 1000),
  };
  
  await createSubscriptionRecord(subscriptionData);
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const updateData = {
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
  
  await updateSubscriptionStatus(updateData);
}

async function handleSubscriptionCancelled(subscription) {
  console.log('Subscription cancelled:', subscription.id);
  
  const cancellationData = {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    cancelledAt: new Date(),
    cancelReason: subscription.cancellation_details?.reason,
  };
  
  await handleSubscriptionCancellation(cancellationData);
}

// Database operations using Supabase

async function logConversion(data) {
  try {
    // Log subscription event
    const { error: eventError } = await supabaseAdmin
      .from('subscription_events')
      .insert({
        event_type: 'checkout_completed',
        stripe_session_id: data.sessionId,
        stripe_customer_id: data.customerId,
        stripe_subscription_id: data.subscriptionId,
        user_id: data.userId,
        event_data: data,
        created_at: new Date().toISOString()
      });

    if (eventError) {
      console.error('Error logging conversion event:', eventError);
    }

    // Update user profile with subscription info
    if (data.userId) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: 'premium',
          subscription_status: 'active',
          subscription_id: data.subscriptionId,
          customer_id: data.customerId,
          trial_end_date: null, // Clear trial when premium starts
          upgraded_at: new Date().toISOString(),
          subscription_metadata: {
            trigger: data.trigger,
            trial_days_remaining: data.trialDaysRemaining,
            trial_messages_used: data.trialMessagesUsed,
            amount_paid: data.amount,
            currency: data.currency
          }
        })
        .eq('id', data.userId);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
      } else {
        console.log('User converted to premium:', data.userId);
      }
    }
  } catch (error) {
    console.error('Error in logConversion:', error);
  }
}

async function updateSubscriptionStatus(data) {
  try {
    // First, find the user by customer_id
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('customer_id', data.customerId)
      .single();

    if (findError || !profile) {
      console.error('User not found for customer:', data.customerId);
      return;
    }

    // Update subscription status
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: data.status,
        subscription_period_start: data.currentPeriodStart.toISOString(),
        subscription_period_end: data.currentPeriodEnd.toISOString(),
        last_payment_date: data.lastPaymentDate?.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating subscription status:', error);
    } else {
      console.log('Subscription status updated for user:', profile.id);
    }

    // Log the event
    await supabaseAdmin
      .from('subscription_events')
      .insert({
        event_type: 'payment_succeeded',
        stripe_subscription_id: data.subscriptionId,
        stripe_customer_id: data.customerId,
        user_id: profile.id,
        event_data: data,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error in updateSubscriptionStatus:', error);
  }
}

async function handlePaymentFailure(data) {
  try {
    // Find user by customer_id
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('customer_id', data.customerId)
      .single();

    if (findError || !profile) {
      console.error('User not found for customer:', data.customerId);
      return;
    }

    // Update subscription status to indicate payment issues
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'past_due',
        payment_failure_count: data.attemptCount,
        last_payment_failure: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating payment failure status:', error);
    }

    // Log the payment failure event
    await supabaseAdmin
      .from('subscription_events')
      .insert({
        event_type: 'payment_failed',
        stripe_subscription_id: data.subscriptionId,
        stripe_customer_id: data.customerId,
        user_id: profile.id,
        event_data: data,
        created_at: new Date().toISOString()
      });

    console.log('Payment failure handled for user:', profile.id);
  } catch (error) {
    console.error('Error in handlePaymentFailure:', error);
  }
}

async function createSubscriptionRecord(data) {
  try {
    // Find user by customer_id
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('customer_id', data.customerId)
      .single();

    if (findError || !profile) {
      console.error('User not found for customer:', data.customerId);
      return;
    }

    // Update user profile with new subscription
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: 'premium',
        subscription_status: data.status,
        subscription_id: data.subscriptionId,
        subscription_period_start: data.currentPeriodStart.toISOString(),
        subscription_period_end: data.currentPeriodEnd.toISOString(),
        price_id: data.priceId,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error creating subscription record:', error);
    } else {
      console.log('Subscription record created for user:', profile.id);
    }

    // Log the subscription creation event
    await supabaseAdmin
      .from('subscription_events')
      .insert({
        event_type: 'subscription_created',
        stripe_subscription_id: data.subscriptionId,
        stripe_customer_id: data.customerId,
        user_id: profile.id,
        event_data: data,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error in createSubscriptionRecord:', error);
  }
}

async function handleSubscriptionCancellation(data) {
  try {
    // Find user by customer_id
    const { data: profile, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('customer_id', data.customerId)
      .single();

    if (findError || !profile) {
      console.error('User not found for customer:', data.customerId);
      return;
    }

    // Update subscription status to cancelled
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_cancelled_at: data.cancelledAt.toISOString(),
        cancellation_reason: data.cancelReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error handling subscription cancellation:', error);
    } else {
      console.log('Subscription cancelled for user:', profile.id);
    }

    // Log the cancellation event
    await supabaseAdmin
      .from('subscription_events')
      .insert({
        event_type: 'subscription_cancelled',
        stripe_subscription_id: data.subscriptionId,
        stripe_customer_id: data.customerId,
        user_id: profile.id,
        event_data: data,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error in handleSubscriptionCancellation:', error);
  }
}