import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextRequest } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

// subscription management api

export async function GET() {
  try {
    console.log('GET /api/subscriptions called')
    

    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('Available cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    const supabase = await createClient()
    console.log('Supabase client created for GET')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('GET Auth check - User:', user?.id, 'Error:', authError)
    
    if (authError || !user) {
      console.log('GET Auth failed:', authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    const { data: subscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('brand, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }


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

// send welcome email
async function sendWelcomeEmail(userEmail: string, brandName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'MatchaRestock <notifications@updates.matcharestock.com>',
      to: [userEmail],
      subject: `You're successfully signed up for ${brandName} restocks!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to MatchaRestock!</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #f1f5f9; margin: 0; padding: 16px;">
            <div style="width: 100%; max-width: 672px; margin: 0 auto;">
              <div style="background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); width: 100%; padding: 40px; text-align: left;">
                
                <!-- Header -->
                <header style="margin-bottom: 32px;">
                  <h1 style="font-size: 30px; font-weight: 700; color: #1e293b; margin: 0;">
                    Welcome to <span style="color: #324335;">MatchaRestock!</span>
                  </h1>
                </header>

                <!-- Main Content -->
                <main style="color: #475569;">
                  <div style="margin-bottom: 24px;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0;">
                      Great news! You're now subscribed to receive restock notifications for ${brandName} matcha.
                    </p>
                  </div>
                  
                  <div style="margin-bottom: 24px;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0;">
                      We'll send you an email as soon as any ${brandName} blends come back in stock, so you never miss out on your favorite matcha again.
                    </p>
                  </div>

                  <!-- What Happens Next Section -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 16px; margin-top: 0;">
                      What happens next?
                    </h2>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                      <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <span style="color: #324335; margin-right: 12px; margin-top: 2px; font-size: 20px; flex-shrink: 0;">✓</span>
                        <span style="font-size: 16px; line-height: 1.6;">We monitor ${brandName} inventory in real-time</span>
                      </li>
                      <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <span style="color: #324335; margin-right: 12px; margin-top: 2px; font-size: 20px; flex-shrink: 0;">✓</span>
                        <span style="font-size: 16px; line-height: 1.6;">You'll get instant notifications when restocks happen</span>
                      </li>
                      <li style="display: flex; align-items: flex-start;">
                        <span style="color: #324335; margin-right: 12px; margin-top: 2px; font-size: 20px; flex-shrink: 0;">✓</span>
                        <span style="font-size: 16px; line-height: 1.6;">You can manage your subscriptions anytime in your dashboard</span>
                      </li>
                    </ul>
                  </div>
                </main>

                <!-- Separator -->
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

                <!-- Footer -->
                <footer style="text-align: left; font-size: 12px; color: #64748b;">
                  <p style="margin-bottom: 16px;">
                    <a href="https://matcharestock.com" style="text-decoration: underline; color: #324335;">
                      Manage your subscriptions
                    </a>
                  </p>
                  <p style="margin: 0;">© 2025 MatchaRestock. All rights reserved.</p>
                </footer>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email sending error:', error)
      return false
    }

    console.log('Welcome email sent successfully:', data?.id)
    return true
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return false
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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check - User:', user?.id, 'Error:', authError)
    
    if (authError || !user) {
      console.log('Auth failed:', authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


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

      const newIsActive = !existingSubscription.is_active
      
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          is_active: newIsActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)

      if (updateError) {
        console.error('Database update error:', updateError)
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }

      
      if (newIsActive) {
        console.log(`Sending welcome email for reactivated ${brand} subscription`)
        await sendWelcomeEmail(user.email!, brand)
      }

      return NextResponse.json({ 
        success: true, 
        brand, 
        isSubscribed: newIsActive 
      })
    } else {

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


      console.log(`Sending welcome email for new ${brand} subscription`)
      await sendWelcomeEmail(user.email!, brand)

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

interface RestockProduct {
  name: string;
  url?: string;
}

interface RestockNotificationRequest {
  brand: string;
  products: RestockProduct[];
  apiKey: string;
}


const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { brand, products, apiKey }: RestockNotificationRequest = await request.json();

    console.log(`🔔 Restock notification received for ${brand}:`, products.map(p => p.name));


    if (!apiKey || apiKey !== SCRAPER_API_KEY) {
      console.log('❌ Unauthorized restock notification attempt');
      return NextResponse.json(
        { error: 'Unauthorized', code: 'INVALID_API_KEY' },
        { status: 401 }
      );
    }


    if (!brand || !products || !Array.isArray(products) || products.length === 0) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: brand and products', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }


    const invalidProducts = products.filter(p => !p.name);
    if (invalidProducts.length > 0) {
      console.log('❌ Invalid products found');
      return NextResponse.json(
        { error: 'All products must have a name', code: 'INVALID_PRODUCTS' },
        { status: 400 }
      );
    }

    // use service role to bypass rls
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // find subscribers for this brand
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('user_id, email, brand')
      .eq('brand', brand)
      .eq('is_active', true);



    if (subsError) {
      console.error('❌ Database error:', subsError);
      return NextResponse.json(
        { error: 'Database error', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`📭 No active subscriptions found for "${brand}"`);
      return NextResponse.json({
        message: 'No active subscriptions found',
        brand,
        notified: 0
      });
    }

    console.log(`📧 Found ${subscriptions.length} subscribers for ${brand}`);


    const emailSubject = `🍵 ${brand} is back in stock!`;
    
    const productListHtml = products.map(product => {
      const shopLink = product.url 
        ? `<a href="${product.url}" style="color: #059669; text-decoration: none; font-weight: 500;">[Shop Now]</a>`
        : '';
      
      return `
        <div style="margin-bottom: 12px; padding: 12px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
          <div style="font-weight: 600; color: #065f46;">${product.name}</div>
          ${shopLink}
        </div>
      `;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailSubject}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap');
          </style>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #f1f5f9; margin: 0; padding: 16px;">
          <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
            <div style="background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); width: 100%; max-width: 672px; margin: 0 auto; padding: 40px;">
              
              <!-- Header -->
              <header style="margin-bottom: 32px;">
                <div style="margin-bottom: 8px;">
                  <h1 style="font-size: 24px; font-weight: 600; color: #324335; margin: 0; font-family: 'Source Serif 4', Georgia, serif;">MatchaRestock</h1>
                </div>
              </header>

              <!-- Main Content -->
              <main>
                <div>
                  <h2 style="font-size: 30px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">${brand} is back in stock.</h2>
                  <p style="color: #64748b; margin: 0;">
                    The matcha you've been waiting for is finally available. Here are the products that just restocked:
                  </p>
                </div>

                <!-- Product List -->
                <div style="margin: 32px 0;">
                  ${products.map(product => `
                    <div style="border: 1px solid #e2e8f0; border-left: 4px solid #324335; border-radius: 8px; padding: 24px; margin-bottom: 16px; text-align: left;">
                      <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 8px 0; text-align: left;">${product.name}</h3>
                      <p style="color: #64748b; margin: 8px 0 16px 0; text-align: left;">Don't wait – premium matcha sells out quickly!</p>
                      <div style="text-align: left;">
                        <a href="${product.url || '#'}" 
                           style="display: inline-block; background-color: #324335; color: white; font-weight: 700; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
                          Shop Now
                        </a>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </main>

              <!-- Separator -->
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

              <!-- Footer -->
              <footer style="text-align: center; font-size: 12px; color: #64748b;">
                <p style="margin-bottom: 8px;">You're receiving this because you subscribed to restock notifications.</p>
                <p style="margin-bottom: 16px;">
                  <a href="https://matcharestock.com/dashboard" style="text-decoration: underline; color: #324335;">
                    Manage your subscriptions
                  </a>
                </p>
                <p style="margin: 0;">© 2025 MatchaRestock. All rights reserved.</p>
              </footer>
            </div>
          </div>
        </body>
      </html>
    `;


    let emailsSent = 0;
    let emailErrors = 0;

    for (const subscription of subscriptions) {
      try {
        const userEmail = subscription.email;
        if (!userEmail) {
          console.log('⚠️  Skipping subscription - no email found');
          continue;
        }


        console.log(`📧 Sending restock notification to: ${userEmail}`);
        console.log(`📧 Subject: ${emailSubject}`);
        console.log(`📧 Products: ${products.map(p => p.name).join(', ')}`);
        
        const { data, error } = await resend.emails.send({
          from: 'MatchaRestock <notifications@updates.matcharestock.com>',
          to: [userEmail],
          subject: emailSubject,
          html: emailHtml
        });

        if (error) {
          console.error('❌ Resend error:', error);
          throw error;
        }

        console.log('✅ Email sent successfully:', data?.id);

        emailsSent++;
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        emailErrors++;
      }
    }

    console.log(`✅ Brand notification complete: ${emailsSent} emails sent, ${emailErrors} errors`);

    return NextResponse.json({
      message: 'Restock notifications sent successfully',
      brand,
      products: products.map(p => p.name),
      notified: emailsSent,
      errors: emailErrors
    });

  } catch (error) {
    console.error('❌ Error sending restock notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
