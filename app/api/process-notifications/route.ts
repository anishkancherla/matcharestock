import { NextResponse } from "next/server"

interface NotificationStats {
  total_pending: number
  brands_notified: number
  failures: number
  notification_results: Array<{
    brand: string
    products: string[]
    success: boolean
    notified?: number
    error?: string
  }>
}

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()
    
    // Authentication
    if (!apiKey || apiKey !== process.env.SCRAPER_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("📧 Processing pending restock notifications...")

    // Use service role to access all tables
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get pending notifications from the last hour that haven't been sent
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('restock_notifications')
      .select('*')
      .gte('created_at', oneHourAgo)
      .eq('email_sent', false)

    if (fetchError) {
      console.error('❌ Error fetching pending notifications:', fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log("📭 No pending notifications found")
      return NextResponse.json({
        success: true,
        total_pending: 0,
        brands_notified: 0,
        failures: 0,
        notification_results: [],
        message: "No pending notifications to process"
      })
    }

    console.log(`📬 Found ${pendingNotifications.length} pending notifications`)

    // Group notifications by brand for batched emails
    const brandGroups: { [brand: string]: any[] } = {}
    
    for (const notification of pendingNotifications) {
      const brand = notification.brand
      if (!brandGroups[brand]) {
        brandGroups[brand] = []
      }
      brandGroups[brand].push(notification)
    }

    console.log(`📦 Grouped into ${Object.keys(brandGroups).length} brands`)

    const stats: NotificationStats = {
      total_pending: pendingNotifications.length,
      brands_notified: 0,
      failures: 0,
      notification_results: []
    }

    // Process each brand
    for (const [brand, notifications] of Object.entries(brandGroups)) {
      console.log(`\n🏷️ Processing ${brand} (${notifications.length} products)`)
      
      const notificationIds = notifications.map(n => n.id)
      
      try {
        // Prepare products for the notification API
        const products = notifications.map(notification => ({
          name: notification.product_name, // Fixed: was notification.product
          url: notification.product_url || null
        }))

        // Call the existing subscriptions API for brand-level notifications
        const notifyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brand: brand,
            products: products,
            apiKey: process.env.SCRAPER_API_KEY
          })
        })

        if (notifyResponse.ok) {
          const result = await notifyResponse.json()
          const notified = result.notified || 0
          
          stats.brands_notified += 1
          stats.notification_results.push({
            brand: brand,
            products: products.map(p => p.name),
            success: true,
            notified: notified
          })
          
          console.log(`✅ Sent to ${notified} subscribers for ${brand}`)

          // Mark notifications as sent
          const { error: updateError } = await supabase
            .from('restock_notifications')
            .update({
              email_sent: true,
              sent_at: new Date().toISOString(),
              subscribers_notified: notified
            })
            .in('id', notificationIds)

          if (updateError) {
            console.error(`❌ Error marking notifications as sent for ${brand}:`, updateError)
          } else {
            console.log(`📝 Marked ${notificationIds.length} notifications as sent for ${brand}`)
          }

        } else {
          const errorText = await notifyResponse.text()
          console.error(`❌ Failed to send notification for ${brand}: ${notifyResponse.status} - ${errorText}`)
          
          stats.failures += 1
          stats.notification_results.push({
            brand: brand,
            products: products.map(p => p.name),
            success: false,
            error: `API call failed: ${notifyResponse.status}`
          })

          // Mark notifications as failed
          const { error: updateError } = await supabase
            .from('restock_notifications')
            .update({
              email_sent: false,
              sent_at: new Date().toISOString(),
              subscribers_notified: 0
            })
            .in('id', notificationIds)

          if (updateError) {
            console.error(`❌ Error marking notifications as failed for ${brand}:`, updateError)
          }
        }
      } catch (error) {
        console.error(`❌ Error processing notifications for ${brand}:`, error)
        
        stats.failures += 1
        stats.notification_results.push({
          brand: brand,
          products: notifications.map(n => n.product),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Small delay between brands to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`\n📊 NOTIFICATION PROCESSING COMPLETE`)
    console.log(`📧 Brands notified: ${stats.brands_notified}`)
    console.log(`❌ Failures: ${stats.failures}`)
    console.log(`📬 Total notifications processed: ${stats.total_pending}`)

    return NextResponse.json({
      success: true,
      ...stats,
      message: `Processed ${stats.total_pending} notifications for ${stats.brands_notified} brands`
    })

  } catch (error) {
    console.error("Notification processing API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 