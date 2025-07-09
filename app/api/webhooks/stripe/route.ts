import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Disable Next.js body parsing for webhooks
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('🚀 WEBHOOK HANDLER CALLED - START')
  
  try {
    // Initialize Stripe inside the function to avoid build-time issues
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.log(`❌ Webhook signature verification failed.`, err)
      return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
    }

    console.log('✅ Webhook received:', event.type)

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          const customerId = session.customer as string
          const userId = session.metadata?.supabase_user_id

          if (!userId) {
            console.error('No user ID in session metadata')
            break
          }

          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          // Get billing period from the subscription items (this is where Stripe stores the billing periods)
          const firstItem = subscription.items.data[0]
          const currentPeriodStart = firstItem?.current_period_start
          const currentPeriodEnd = firstItem?.current_period_end

          console.log('🔍 Subscription items structure:', {
            itemsCount: subscription.items.data.length,
            firstItemId: firstItem?.id,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
          })

          console.log('📅 Subscription periods:', {
            start: currentPeriodStart,
            end: currentPeriodEnd,
            status: subscription.status,
            userId: userId
          })

          // Upsert the payment subscription record - use stripe_subscription_id for conflict resolution
          const { error } = await supabase
            .from('user_payment_subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: subscription.status,
              current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
              current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'stripe_subscription_id'
            })

          if (error) {
            console.error('Error updating payment subscription:', error)
            throw error // Re-throw to cause webhook to fail and retry
          } else {
            console.log('✅ Payment subscription created/updated for user:', userId)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Get billing period from the subscription items (this is where Stripe stores the billing periods)
        const firstItem = subscription.items.data[0]
        const currentPeriodStart = firstItem?.current_period_start
        const currentPeriodEnd = firstItem?.current_period_end

        // Update the subscription status and details
        const { error } = await supabase
          .from('user_payment_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
            current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('✅ Subscription updated:', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Mark subscription as canceled
        const { error } = await supabase
          .from('user_payment_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error canceling subscription:', error)
        } else {
          console.log('✅ Subscription canceled:', subscription.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string }
        const subscriptionId = invoice.subscription
        
        if (subscriptionId) {
          // Mark subscription as past_due
          const { error } = await supabase
            .from('user_payment_subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) {
            console.error('Error updating subscription to past_due:', error)
          } else {
            console.log('✅ Subscription marked as past_due:', subscriptionId)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
} 