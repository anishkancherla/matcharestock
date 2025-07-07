import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface ProductUpdate {
  brand: string
  product_name: string
  is_in_stock: boolean
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
    
    // Process each product update
    for (const product of products) {
      const { brand, product_name, is_in_stock, stock_url, price, confidence } = product
      
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
        // Check if product already exists
        const { data: existing, error: fetchError } = await supabase
          .from('product_stock')
          .select('*')
          .eq('brand', brand)
          .eq('product_name', product_name)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error(`❌ Error fetching product ${brand} - ${product_name}:`, fetchError)
          results.push({
            product: `${brand} - ${product_name}`,
            success: false,
            error: 'Database fetch error'
          })
          continue
        }

        const updateData: any = {
          brand,
          product_name,
          is_in_stock,
          last_checked: currentTime,
          stock_url: stock_url || null
        }

        // Handle price conversion
        if (price !== undefined && price !== null) {
          updateData.price = typeof price === 'string' ? price : price.toString()
        }

        if (confidence !== undefined && confidence !== null) {
          updateData.confidence = confidence
        }

        let wasRestocked = false

        if (existing) {
          // Product exists - update it
          const wasOutOfStock = !existing.is_in_stock
          const nowInStock = is_in_stock
          
          // Detect restock: was out of stock, now in stock
          if (wasOutOfStock && nowInStock) {
            updateData.stock_change_detected_at = currentTime
            wasRestocked = true
            console.log(`📈 Restock detected: ${brand} - ${product_name}`)
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
        } else {
          // Product doesn't exist - insert it
          if (is_in_stock) {
            updateData.stock_change_detected_at = currentTime
            wasRestocked = true
            console.log(`📈 New product in stock: ${brand} - ${product_name}`)
          }

          const { error: insertError } = await supabase
            .from('product_stock')
            .insert(updateData)

          if (insertError) {
            console.error(`❌ Error inserting ${brand} - ${product_name}:`, insertError)
            results.push({
              product: `${brand} - ${product_name}`,
              success: false,
              error: 'Database insert error'
            })
          } else {
            results.push({
              product: `${brand} - ${product_name}`,
              success: true,
              action: 'created',
              was_restocked: wasRestocked
            })
          }
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

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    const restocks = results.filter(r => r.success && r.was_restocked)

    console.log(`✅ Processed ${successful.length} products successfully, ${failed.length} failed`)
    console.log(`📈 Detected ${restocks.length} restocks (database triggers will handle notifications)`)

    return NextResponse.json({
      success: true,
      processed: products.length,
      successful: successful.length,
      failed: failed.length,
      restocks_detected: restocks.length,
      results: results,
      timestamp: currentTime,
      message: `Database triggers will automatically process ${restocks.length} restock notifications`
    })

  } catch (error) {
    console.error("Stock update API error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 