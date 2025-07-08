import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe inside the function to avoid build-time issues
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Stripe customer ID
    const { data: paymentSub, error: fetchError } = await supabase
      .from('user_payment_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !paymentSub?.stripe_customer_id) {
      return NextResponse.json({ 
        error: 'No active subscription found' 
      }, { status: 404 })
    }

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: paymentSub.stripe_customer_id,
      return_url: `${request.headers.get('origin')}/dashboard`,
    })

    return NextResponse.json({ 
      url: portalSession.url 
    })

  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 