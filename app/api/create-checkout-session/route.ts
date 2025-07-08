import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Create checkout session called')
    
    // Initialize Stripe inside the function to avoid build-time issues
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not configured')
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    
    console.log('✅ Stripe secret key found')
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
    console.log('✅ Stripe client initialized')
    
    const supabase = await createClient()
    console.log('✅ Supabase client created')
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check - User:', user?.id, 'Error:', authError)
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a Stripe customer
    console.log('🔍 Checking for existing Stripe customer')
    const { data: existingPaymentSub, error: dbError } = await supabase
      .from('user_payment_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Database error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    let customerId = existingPaymentSub?.stripe_customer_id
    console.log('Existing customer ID:', customerId ? 'Found' : 'Not found')

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log('🆕 Creating new Stripe customer')
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
      console.log('✅ Created customer:', customerId)
    }

    // Create checkout session
    console.log('💳 Creating checkout session')
    const origin = request.headers.get('origin')
    console.log('Request origin:', origin)
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MatchaRestock Premium',
              description: 'Get unlimited restock notifications for all matcha brands',
            },
            unit_amount: 350, // $3.50
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    console.log('✅ Checkout session created:', checkoutSession.id)
    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })

  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    let statusCode = 500
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Check for specific error types
      if (error.message.includes('STRIPE_SECRET_KEY')) {
        errorMessage = 'Payment system configuration error'
      } else if (error.message.includes('Database error')) {
        errorMessage = 'Database connection error'
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication required'
        statusCode = 401
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: statusCode }
    )
  }
} 