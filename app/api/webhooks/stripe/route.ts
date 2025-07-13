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
      console.error('❌ STRIPE_SECRET_KEY is not configured')
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET is not configured')
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }
    
    console.log('✅ Environment variables check passed')
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Stripe webhook signature verified')
    } catch (err) {
      console.log(`❌ Webhook signature verification failed.`, err)
      return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
    }

    console.log('✅ Webhook received:', event.type)

    // Use service role to bypass RLS
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not configured')
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not configured')
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    }
    
    console.log('✅ Supabase environment variables found')
    console.log('🔍 SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔍 SERVICE_ROLE_KEY (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    console.log('✅ Supabase client created')

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('🔄 Processing checkout.session.completed')
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          console.log('✅ Session mode is subscription')
          const subscriptionId = session.subscription as string
          const customerId = session.customer as string
          const userId = session.metadata?.supabase_user_id

          console.log('🔍 Session details:', {
            subscriptionId,
            customerId,
            userId
          })

          if (!userId) {
            console.error('❌ No user ID in session metadata')
            break
          }

          console.log('🔄 Retrieving subscription from Stripe...')
          // Get the subscription details
          let subscription: Stripe.Subscription
          try {
            subscription = await stripe.subscriptions.retrieve(subscriptionId)
            console.log('✅ Successfully retrieved subscription from Stripe')
            console.log('🔍 Subscription status:', subscription.status)
          } catch (stripeError) {
            console.error('❌ Failed to retrieve subscription from Stripe:', stripeError)
            throw stripeError
          }

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

          // Prepare data for upsert
          const upsertData = {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
            current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }
          
          console.log('🔍 Data to upsert:', upsertData)
          console.log('🔄 Attempting database upsert...')

          // Upsert the payment subscription record - use stripe_subscription_id for conflict resolution
          const { error } = await supabase
            .from('user_payment_subscriptions')
            .upsert(upsertData, {
              onConflict: 'stripe_subscription_id'
            })

          if (error) {
            console.error('❌ Database upsert failed:', error)
            console.error('❌ Error details:', JSON.stringify(error, null, 2))
            throw error // Re-throw to cause webhook to fail and retry
          } else {
            console.log('✅ Payment subscription created/updated for user:', userId)
            
            // Update user profile to premium and set payment details
            console.log('🔄 Updating user profile to premium...')
            const { error: userUpdateError } = await supabase
              .from('users')
              .update({
                user_type: 'premium',
                stripe_customer_id: customerId,
                first_payment_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId)

            if (userUpdateError) {
              console.error('❌ Failed to update user profile:', userUpdateError)
              // Don't throw - payment subscription was successful, user profile update is secondary
            } else {
              console.log('✅ User profile updated to premium for user:', userId)
            }
          }
        } else {
          console.log('ℹ️ Session mode is not subscription:', session.mode)
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
          
          // Update user type based on subscription status
          console.log('🔄 Updating user type based on subscription status...')
          const newUserType = subscription.status === 'active' || subscription.status === 'trialing' ? 'premium' : 'free'
          
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({
              user_type: newUserType,
              updated_at: new Date().toISOString(),
            })
            .eq('id', (await supabase
              .from('user_payment_subscriptions')
              .select('user_id')
              .eq('stripe_subscription_id', subscription.id)
              .single()
            ).data?.user_id)

          if (userUpdateError) {
            console.error('❌ Failed to update user type:', userUpdateError)
          } else {
            console.log(`✅ User type updated to ${newUserType} for subscription:`, subscription.id)
          }
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
          
          // Downgrade user to free when subscription is canceled
          console.log('🔄 Downgrading user to free tier...')
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({
              user_type: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', (await supabase
              .from('user_payment_subscriptions')
              .select('user_id')
              .eq('stripe_subscription_id', subscription.id)
              .single()
            ).data?.user_id)

          if (userUpdateError) {
            console.error('❌ Failed to downgrade user:', userUpdateError)
          } else {
            console.log('✅ User downgraded to free for canceled subscription:', subscription.id)
          }
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

    console.log('✅ Webhook processing completed successfully')
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
} 