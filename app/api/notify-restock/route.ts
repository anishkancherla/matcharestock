import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// restock notification endpoint

// send restock email
async function sendRestockEmail(userEmail: string, brandName: string, productName?: string, productUrl?: string) {
  try {
    const productInfo = productName ? ` for ${productName}` : ""
    const productLink = productUrl ? `<a href="${productUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Shop ${productName || brandName} Now</a>` : ""
    
    const { data, error } = await resend.emails.send({
      from: 'notifications@updates.matcharestock.com',
      to: [userEmail],
      subject: `🍵 ${brandName} is back in stock${productInfo}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981; text-align: center;">🍵 Great News!</h1>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
            <h2 style="color: #059669; margin-top: 0;">
              ${brandName}${productInfo} is back in stock!
            </h2>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              The matcha you've been waiting for is available again. Don't wait too long - premium matcha tends to sell out quickly!
            </p>
          </div>
          
          ${productLink}
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Quick reminder:</h3>
            <ul style="color: #6b7280; line-height: 1.6;">
              <li>Premium matcha typically sells out fast</li>
              <li>We recommend purchasing soon to avoid disappointment</li>
              <li>You can manage your notifications in your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="color: #2563eb;">dashboard</a></li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
            Happy matcha hunting! 🍵<br>
            The MatchaRestock Team<br>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="color: #2563eb;">Manage notifications</a>
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Restock email sending error:', error)
      return false
    }

    console.log('Restock email sent successfully:', data?.id)
    return true
  } catch (error) {
    console.error('Failed to send restock email:', error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { brand, product, productUrl, apiKey } = await request.json()
    

    if (!apiKey || apiKey !== process.env.SCRAPER_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!brand) {
      return NextResponse.json({ error: "Brand is required" }, { status: 400 })
    }

    console.log(`Restock notification triggered for brand: ${brand}, product: ${product}`)

    const supabase = await createClient()
    

    const { data: subscribers, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('email')
      .eq('brand', brand)
      .eq('is_active', true)

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      console.log(`No active subscribers found for brand: ${brand}`)
      return NextResponse.json({ 
        success: true, 
        message: "No subscribers to notify",
        notified: 0
      })
    }

    console.log(`Found ${subscribers.length} subscribers for ${brand}`)


    const emailPromises = subscribers.map(subscriber => 
      sendRestockEmail(subscriber.email, brand, product, productUrl)
    )
    
    const emailResults = await Promise.allSettled(emailPromises)
    const successfulEmails = emailResults.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length

    console.log(`Successfully sent ${successfulEmails} out of ${subscribers.length} restock emails`)


    const { error: logError } = await supabase
      .from('restock_notifications')
      .insert({
        brand,
        product: product || null,
        product_url: productUrl || null,
        subscribers_notified: successfulEmails,
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Failed to log restock notification:', logError)

    }

    return NextResponse.json({
      success: true,
      brand,
      product: product || null,
      notified: successfulEmails,
      total_subscribers: subscribers.length
    })

  } catch (error) {
    console.error("Restock notification API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 