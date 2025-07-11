import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function DELETE() {
  try {
    console.log('🗑️ Delete account API called')
    
    // Check required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
    
    const supabase = await createClient()
    
    // Create admin client for user deletion (requires service role key)
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`🔍 Deleting account for user: ${user.id}`)

    // Step 1: Cancel any active Stripe subscriptions
    try {
      const { data: paymentSubs, error: paymentSubError } = await supabase
        .from('user_payment_subscriptions')
        .select('stripe_customer_id, stripe_subscription_id')
        .eq('user_id', user.id)

      if (paymentSubError) {
        console.error('❌ Error fetching payment subscriptions:', paymentSubError)
      } else if (paymentSubs && paymentSubs.length > 0) {
        console.log(`📋 Found ${paymentSubs.length} payment subscription(s) to cancel`)
        
        for (const paymentSub of paymentSubs) {
          if (paymentSub.stripe_subscription_id) {
            try {
              console.log(`🚫 Cancelling Stripe subscription: ${paymentSub.stripe_subscription_id}`)
              await stripe.subscriptions.cancel(paymentSub.stripe_subscription_id)
              console.log(`✅ Cancelled Stripe subscription: ${paymentSub.stripe_subscription_id}`)
            } catch (stripeError) {
              console.error(`❌ Error cancelling Stripe subscription ${paymentSub.stripe_subscription_id}:`, stripeError)
              // Continue with deletion even if Stripe cancellation fails
            }
          }
        }
      } else {
        console.log('ℹ️ No payment subscriptions found to cancel')
      }
    } catch (error) {
      console.error('❌ Error handling Stripe subscriptions:', error)
      // Continue with deletion even if Stripe handling fails
    }

    // Step 2: Delete user's subscription data
    console.log('🗑️ Deleting user subscriptions')
    const { error: subscriptionDeleteError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', user.id)

    if (subscriptionDeleteError) {
      console.error('❌ Error deleting user subscriptions:', subscriptionDeleteError)
      throw new Error(`Failed to delete user subscriptions: ${subscriptionDeleteError.message}`)
    }

    // Step 3: Delete user's payment subscription data
    console.log('🗑️ Deleting payment subscriptions')
    const { error: paymentDeleteError } = await supabase
      .from('user_payment_subscriptions')
      .delete()
      .eq('user_id', user.id)

    if (paymentDeleteError) {
      console.error('❌ Error deleting payment subscriptions:', paymentDeleteError)
      throw new Error(`Failed to delete payment subscriptions: ${paymentDeleteError.message}`)
    }

    // Step 4: Delete the user from Supabase Auth
    // Note: This will cascade delete all auth-related data (sessions, refresh_tokens, etc.)
    console.log('🗑️ Deleting user from Supabase Auth')
    const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('❌ Error deleting user from Supabase Auth:', deleteUserError)
      throw new Error(`Failed to delete user: ${deleteUserError.message}`)
    }

    console.log('✅ Account successfully deleted')
    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })

  } catch (error) {
    console.error('❌ Account deletion failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 