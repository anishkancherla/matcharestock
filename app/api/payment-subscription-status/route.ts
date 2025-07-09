import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Check if user has active payment subscription
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Query the user_payment_subscriptions table
    const { data: paymentSubscription, error: fetchError } = await supabase
      .from('user_payment_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Database fetch error:', fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // If no payment subscription record exists, user is not subscribed
    if (!paymentSubscription) {
      return NextResponse.json({ 
        isSubscribed: false,
        reason: 'No payment subscription found'
      })
    }

    const now = new Date()
    const currentPeriodStart = paymentSubscription.current_period_start ? new Date(paymentSubscription.current_period_start) : null
    const currentPeriodEnd = paymentSubscription.current_period_end ? new Date(paymentSubscription.current_period_end) : null

    // Debug logging
    console.log('🐛 Subscription validation debug:')
    console.log('  Current time (now):', now.toISOString())
    console.log('  Period start (raw):', paymentSubscription.current_period_start)
    console.log('  Period end (raw):', paymentSubscription.current_period_end)
    console.log('  Period start (parsed):', currentPeriodStart?.toISOString())
    console.log('  Period end (parsed):', currentPeriodEnd?.toISOString())
    console.log('  Status:', paymentSubscription.status)
    console.log('  Now >= start?', currentPeriodStart ? now >= currentPeriodStart : 'No start date')
    console.log('  Now <= end?', currentPeriodEnd ? now <= currentPeriodEnd : 'No end date')

    // Check if subscription is in a valid state (simplified - trust the database triggers)
    const validStatuses = ['active', 'trialing']
    const isSubscribed = validStatuses.includes(paymentSubscription.status)

    console.log('  Has valid status?', isSubscribed)
    console.log('  Final isSubscribed?', isSubscribed)

    // Provide detailed reason for debugging
    const reason = isSubscribed ? 'Active subscription' : `Invalid status: ${paymentSubscription.status}`

    return NextResponse.json({ 
      isSubscribed,
      reason,
      subscription: {
        status: paymentSubscription.status,
        current_period_start: paymentSubscription.current_period_start,
        current_period_end: paymentSubscription.current_period_end,
        cancel_at_period_end: paymentSubscription.cancel_at_period_end
      }
    })

  } catch (error) {
    console.error("Payment subscription check error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 