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
      from: 'notifications@updates.matcharestock.com',
      to: [userEmail],
      subject: `You're successfully signed up for ${brandName} restocks!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000000; text-align: left;">Welcome to MatchaRestock!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #000000;">
            Great news! You're now subscribed to receive restock notifications for <strong>${brandName}</strong>.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #000000;">
            We'll send you an email as soon as any ${brandName} blends come back in stock, so you never miss out on your favorite matcha again.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #000000; margin-top: 0;">What happens next?</h3>
            <ul style="color: #000000; line-height: 1.6;">
              <li>We monitor ${brandName} inventory in real-time</li>
              <li>You'll get instant notifications when restocks happen</li>
              <li>You can manage your subscriptions anytime in your dashboard</li>
            </ul>
          </div>
        </div>
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
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🍵 Great News!</h1>
              <p style="color: #a7f3d0; margin: 8px 0 0 0; font-size: 18px;">${brand} products are back in stock</p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; margin-bottom: 24px;">
                The matcha you've been waiting for is finally available! Here are the ${brand} products that just restocked:
              </p>

              <!-- Product List -->
              <div style="margin-bottom: 32px;">
                ${productListHtml}
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; margin-bottom: 32px;">
                <p style="margin-bottom: 16px; font-size: 16px; color: #6b7280;">
                  Don't wait – premium matcha sells out quickly!
                </p>
                <a href="https://matcharestock.com/dashboard" 
                   style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View All Restocks
                </a>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                  You're receiving this because you subscribed to ${brand} restock notifications.
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
              Powered by <strong>MatchaRestock</strong> • Your premium matcha monitor
            </p>
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
          from: 'notifications@updates.matcharestock.com',
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
