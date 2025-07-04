import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API route to handle email subscription management.
 * GET: Fetch user's current subscriptions
 * PUT: Toggle user subscriptions for specific brands (Ippodo, Marukyu Koyamaen, etc.)
 */

export async function GET() {
  try {
    console.log('GET /api/subscriptions called')
    
    // Debug: Check what cookies are available
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('Available cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    const supabase = await createClient()
    console.log('Supabase client created for GET')
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('GET Auth check - User:', user?.id, 'Error:', authError)
    
    if (authError || !user) {
      console.log('GET Auth failed:', authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's active subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('brand, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Return array of brand names
    const subscribedBrands = subscriptions?.map(sub => sub.brand) || []
    
    return NextResponse.json({ 
      success: true, 
      subscriptions: subscribedBrands 
    })

  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
export async function PUT(request: Request) {
  try {
    console.log('PUT /api/subscriptions called')
    const { brand } = await request.json()
    console.log('Brand received:', brand)
    
    if (!brand) {
      console.log('Error: No brand provided')
      return NextResponse.json({ error: "Brand is required" }, { status: 400 })
    }

    const supabase = await createClient()
    console.log('Supabase client created')
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check - User:', user?.id, 'Error:', authError)
    
    if (authError || !user) {
      console.log('Auth failed:', authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if subscription already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('brand', brand)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database fetch error:', fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingSubscription) {
      // Toggle existing subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          is_active: !existingSubscription.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)

      if (updateError) {
        console.error('Database update error:', updateError)
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        brand, 
        isSubscribed: !existingSubscription.is_active 
      })
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          brand: brand,
          email: user.email!,
          is_active: true
        })

      if (insertError) {
        console.error('Database insert error:', insertError)
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        brand, 
        isSubscribed: true 
      })
    }

  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
