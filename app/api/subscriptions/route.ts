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
    
    // DEBUG: Log all emails we're about to process
    console.log('📧 All subscribers found:', subscriptions.map(s => s.email));

    // More personal, less promotional subject line
    const emailSubject = `Matcha is available!!`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailSubject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #ffffff; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Simple Header -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333333; margin: 0; font-size: 20px; font-weight: 500;">Hi there,</h2>
              <p style="color: #666666; margin: 10px 0 0 0; font-size: 16px;">Good news about ${brand} - some products are available again:</p>
            </div>
            
            <!-- Simple Product List -->
            <div style="margin: 25px 0;">
              ${products.map(product => `
                <div style="margin-bottom: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
                  <div style="font-weight: 500; color: #333333; font-size: 16px;">${product.name}</div>
                  <div style="color: #666666; font-size: 14px; margin-top: 5px;">Available now</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Simple Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center;">
            <p style="font-size: 12px; color: #888888; margin: 0;">
              <a href="https://matcharestock.com/dashboard" style="color: #888888; text-decoration: none;">Update preferences</a>
            </p>
            <p style="font-size: 12px; color: #888888; margin: 10px 0 0 0;">Have a great day!</p>
          </div>
        </body>
      </html>
    `;

    // Chunk subscribers into batches of 100 (Resend's batch limit)
    const BATCH_SIZE = 100;
    const chunks = [];
    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      chunks.push(subscriptions.slice(i, i + BATCH_SIZE));
    }

    console.log(`📧 Splitting ${subscriptions.length} subscribers into ${chunks.length} batches of ${BATCH_SIZE}`);

    let totalEmailsSent = 0;
    let totalEmailErrors = 0;
    let batchResults = [];

    // Process each batch
    for (let batchIndex = 0; batchIndex < chunks.length; batchIndex++) {
      const chunk = chunks[batchIndex];
      console.log(`📧 Processing batch ${batchIndex + 1}/${chunks.length} with ${chunk.length} emails`);

      try {
        // Prepare batch email array
        const batchEmails = chunk.map(subscription => ({
          from: 'MatchaRestock <notifications@updates.matcharestock.com>',
          to: [subscription.email],
          subject: emailSubject,
          html: emailHtml
        }));

        console.log(`📧 Sending batch ${batchIndex + 1} to:`, chunk.map(s => s.email));

        // Send batch
        const { data, error } = await resend.batch.send(batchEmails);

        if (error) {
          console.error(`❌ Batch ${batchIndex + 1} failed:`, error);
          totalEmailErrors += chunk.length;
          batchResults.push({
            batch: batchIndex + 1,
            status: 'failed',
            count: chunk.length,
            error: error.message
          });
        } else {
          console.log(`✅ Batch ${batchIndex + 1} sent successfully:`, data);
          totalEmailsSent += chunk.length;
          batchResults.push({
            batch: batchIndex + 1,
            status: 'success',
            count: chunk.length,
            data: data
          });
        }

        // Add delay between batches to be safe (except for last batch)
        if (batchIndex < chunks.length - 1) {
          console.log('⏳ Waiting 1 second between batches...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (batchError) {
        console.error(`❌ Batch ${batchIndex + 1} exception:`, batchError);
        totalEmailErrors += chunk.length;
        batchResults.push({
          batch: batchIndex + 1,
          status: 'exception',
          count: chunk.length,
          error: batchError instanceof Error ? batchError.message : String(batchError)
        });
      }
    }

    console.log(`✅ Brand notification complete: ${totalEmailsSent} emails sent, ${totalEmailErrors} errors`);
    console.log('📊 Batch Results:', batchResults);

    return NextResponse.json({
      message: 'Restock notifications sent successfully',
      brand,
      products: products.map(p => p.name),
      notified: totalEmailsSent,
      errors: totalEmailErrors,
      batches: batchResults
    });

  } catch (error) {
    console.error('❌ Error sending restock notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
