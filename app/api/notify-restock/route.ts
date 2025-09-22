import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { sendDiscordNotification } from "@/lib/utils/discord"

const resend = new Resend(process.env.RESEND_API_KEY)

// restock notification endpoint

// send restock email
async function sendRestockEmail(userEmail: string, brandName: string, productName?: string, productUrl?: string) {
  try {
    const productInfo = productName ? ` for ${productName}` : ""
    const productLink = productUrl ? `<a href="${productUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Shop ${productName || brandName} Now</a>` : ""
    
    const { data, error } = await resend.emails.send({
      from: 'MatchaRestock <notifications@updates.matcharestock.com>',
      to: [userEmail],
      subject: `🍵 ${brandName} is back in stock${productInfo}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🍵 ${brandName} is back in stock${productInfo}!</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap');
            </style>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 32px 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;"> Great News!</h1>
                <p style="color: #a7f3d0; margin: 8px 0 0 0; font-size: 18px;">${brandName} is back in stock</p>
              </div>

              <!-- Content -->
              <div style="padding: 32px 24px;">
                <p style="font-size: 16px; margin-bottom: 24px;">
                  The matcha you've been waiting for is finally available again! ${productName ? `<strong>${productName}</strong> from ${brandName}` : `<strong>${brandName}</strong> products`} just restocked.
                </p>

                <!-- Product Info -->
                ${productName ? `
                <div style="margin-bottom: 32px;">
                  <div style="margin-bottom: 12px; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
                    <div style="font-weight: 600; color: #065f46; font-size: 18px;">${productName}</div>
                    <div style="color: #059669; margin-top: 4px;">from ${brandName}</div>
                  </div>
                </div>
                ` : `
                <div style="margin-bottom: 32px;">
                  <div style="margin-bottom: 12px; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
                    <div style="font-weight: 600; color: #065f46; font-size: 18px;">${brandName} Products</div>
                    <div style="color: #059669; margin-top: 4px;">Back in stock now</div>
                  </div>
                </div>
                `}

                <!-- Call to Action -->
                <div style="text-align: center; margin-bottom: 32px;">
                  <p style="margin-bottom: 16px; font-size: 16px; color: #6b7280;">
                    Don't wait – premium matcha sells out quickly!
                  </p>
                  ${productUrl ? `
                  <a href="${productUrl}" 
                     style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">
                    Shop ${productName || brandName} Now
                  </a>
                  ` : ''}
                  <a href="https://matcharestock.com/dashboard" 
                     style="display: inline-block; background-color: #6d9f78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    View All Restocks
                  </a>
                </div>

                <!-- Quick Tips -->
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                  <h3 style="color: #374151; margin-top: 0; margin-bottom: 12px;">Quick reminder:</h3>
                  <ul style="color: #6b7280; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>Premium matcha typically sells out fast</li>
                    <li>We recommend purchasing soon to avoid disappointment</li>
                    <li>You can manage your notifications anytime</li>
                  </ul>
                </div>

                <!-- Footer -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                  <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                    You're receiving this because you subscribed to ${brandName} restock notifications.
                  </p>
                  <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    <a href="https://matcharestock.com/dashboard" style="color: #059669; text-decoration: none;">Manage your subscriptions</a>
                  </p>
                </div>
              </div>
            </div>

            <!-- Signature -->
            <div style="text-align: center; margin-top: 24px;">
              <p style="font-size: 12px; color: #9ca3af;">
                Happy matcha hunting! 🍵<br>
                Powered by <strong style="font-family: 'Source Serif 4', Georgia, serif;">MatchaRestock</strong> • Your premium matcha monitor
              </p>
            </div>
          </body>
        </html>
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

    // Send Discord notification after emails are processed
    if (successfulEmails > 0) {
      console.log('📧 Emails sent, sending Discord notification...');
      const products = product ? [{ name: product, url: productUrl }] : [{ name: `${brand} products` }];
      await sendDiscordNotification(brand, products);
    }

    const { error: logError } = await supabase
      .from('restock_notifications')
      .insert({
        brand,
        product_name: product || null,
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