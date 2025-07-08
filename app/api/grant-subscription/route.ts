import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { brands } = await request.json()
    
    if (!brands || !Array.isArray(brands)) {
      return NextResponse.json({ error: 'Invalid brands data' }, { status: 400 })
    }

    // Check if user has valid payment subscription
    const { data: paymentSub } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!paymentSub) {
      return NextResponse.json({ error: 'No active payment subscription found' }, { status: 403 })
    }

    // Grant subscription for each brand
    const subscriptionPromises = brands.map(async (brand: string) => {
      // Check if subscription already exists
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('brand', brand)
        .single()

      if (existingSub) {
        // Update existing subscription to active
        return supabase
          .from('user_subscriptions')
          .update({ 
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSub.id)
      } else {
        // Create new subscription
        return supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            brand: brand,
            email: user.email!,
            is_active: true
          })
      }
    })

    const results = await Promise.all(subscriptionPromises)
    
    // Check for errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Grant subscription errors:', errors)
      return NextResponse.json({ error: 'Failed to grant some subscriptions' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Granted subscriptions for ${brands.length} brands`
    })

  } catch (error) {
    console.error('Error granting subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 