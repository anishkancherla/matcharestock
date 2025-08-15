import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface ProductUpdate {
  brand: string
  product_name: string
  is_in_stock: boolean
  stock_status?: string // 'in_stock', 'pre_order', 'out_of_stock', etc.
  stock_url?: string
  price?: string | number
  confidence?: number
}

interface StockUpdateRequest {
  products: ProductUpdate[]
  apiKey: string
}

export async function POST(request: Request) {
  try {
    const { products, apiKey }: StockUpdateRequest = await request.json()
    
    // Authentication
    if (!apiKey || apiKey !== process.env.SCRAPER_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Products array is required" }, { status: 400 })
    }

    console.log(`📦 Processing ${products.length} product updates`)

    // Use service role to bypass RLS for scraper operations
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const currentTime = new Date().toISOString()
    const results = []
    const restockNotifications = []
    
    // Process each product update
    for (const product of products) {
      const { brand, product_name, is_in_stock, stock_status, stock_url, price, confidence } = product
      
      if (!brand || !product_name) {
        console.warn(`⚠️ Skipping product with missing brand or name:`, product)
        results.push({
          product: `${brand} - ${product_name}`,
          success: false,
          error: 'Missing brand or product name'
        })
        continue
      }

      try {
        // Find existing product by URL only
        const { data: existing, error: fetchError } = await supabase
          .from('product_stock')
          .select('*')
          .eq('stock_url', stock_url)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error(`❌ Error fetching product:`, fetchError)
          results.push({
            product: `${brand} - ${product_name}`,
            success: false,
            error: 'Database fetch error'
          })
          continue
        }

        if (!existing) {
          console.warn(`⚠️ Product not found for URL: ${stock_url}`)
          results.push({
            product: `${brand} - ${product_name}`,
            success: false,
            error: 'Product not found in database'
          })
          continue
        }

        // Check if stock status changed (for restock detection)
        const wasOutOfStock = !existing.is_in_stock
        const nowInStock = is_in_stock
        
        let wasRestocked = false
        if (wasOutOfStock && nowInStock) {
          wasRestocked = true
          console.log(`📈 Back in stock: ${brand} - ${product_name}`)
          
          // Create restock notification entry
          restockNotifications.push({
            brand,
            product_name: existing.product_name, // Use the name from database for consistency
            product_url: stock_url,
            subscribers_notified: 0, // Will be set when emails are sent
            email_sent: false,
            created_at: currentTime
          })
        }

        // Always update last_checked (scraper checked this URL), only update stock status if it changed
        const updateData: any = {
          last_checked: currentTime
        }
        
        // Only update stock status if it actually changed
        if (existing.is_in_stock !== is_in_stock) {
          updateData.is_in_stock = is_in_stock
          console.log(`🔄 Stock status changed for ${brand} - ${product_name}: ${existing.is_in_stock} → ${is_in_stock}`)
        }

        const { error: updateError } = await supabase
          .from('product_stock')
          .update(updateData)
          .eq('id', existing.id)

        if (updateError) {
          console.error(`❌ Error updating ${brand} - ${product_name}:`, updateError)
          results.push({
            product: `${brand} - ${product_name}`,
            success: false,
            error: 'Database update error'
          })
        } else {
          results.push({
            product: `${brand} - ${product_name}`,
            success: true,
            action: 'updated',
            was_restocked: wasRestocked
          })
        }
      } catch (error) {
        console.error(`❌ Error processing ${brand} - ${product_name}:`, error)
        results.push({
          product: `${brand} - ${product_name}`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Create restock notification entries for all detected restocks
    if (restockNotifications.length > 0) {
      console.log(`📨 Creating ${restockNotifications.length} restock notification entries`)
      
      const { error: notificationError } = await supabase
        .from('restock_notifications')
        .insert(restockNotifications)

      if (notificationError) {
        console.error(`❌ Error creating restock notifications:`, notificationError)
      } else {
        console.log(`✅ Successfully created ${restockNotifications.length} restock notification entries`)
      }
    }

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    const restocks = results.filter(r => r.success && r.was_restocked)

    console.log(`✅ Processed ${successful.length} products successfully, ${failed.length} failed`)
    console.log(`📈 Detected ${restocks.length} restocks - created notification entries for processing`)

    return NextResponse.json({
      success: true,
      processed: products.length,
      successful: successful.length,
      failed: failed.length,
      restocks_detected: restocks.length,
      results: results,
      timestamp: currentTime,
      message: `Created ${restockNotifications.length} restock notification entries for processing`
    })

  } catch (error) {
    console.error("Stock update API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 