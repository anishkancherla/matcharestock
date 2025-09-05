interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
  footer?: {
    text: string
  }
  timestamp?: string
}

interface DiscordMessage {
  content?: string
  embeds?: DiscordEmbed[]
}

// Get brand-specific webhook URL
function getBrandWebhookUrl(brand: string): string | undefined {
  switch (brand.toLowerCase()) {
    case 'ippodo':
      return process.env.DISCORD_WEBHOOK_IPPODO
    case 'marukyu':
    case 'marukyu koyamaen':
      return process.env.DISCORD_WEBHOOK_MARUKYU
    case 'ippodo (global)':
    case 'ippodo global':
      return process.env.DISCORD_WEBHOOK_IPPODO_GLOBAL
    case 'horii shichimeien':
    case 'horii':
      return process.env.DISCORD_WEBHOOK_HORII
    default:
      // Fallback to generic webhook if brand not recognized
      return process.env.DISCORD_WEBHOOK_URL
  }
}

// Get brand-specific styling (emoji and color)
function getBrandConfig(brand: string): { emoji: string, color: number } {
  switch (brand.toLowerCase()) {
    case 'ippodo':
      return { emoji: '🍵', color: 0x4CAF50 } // Green for original Ippodo
    case 'marukyu':
    case 'marukyu koyamaen':
      return { emoji: '🌸', color: 0xE91E63 } // Pink for Marukyu
    case 'ippodo (global)':
    case 'ippodo global':
      return { emoji: '🌍', color: 0x2196F3 } // Blue for Ippodo Global
    case 'horii shichimeien':
    case 'horii':
      return { emoji: '🏛️', color: 0x9B59B6 } // Purple for Horii Shichimeien (historic tea house)
    default:
      return { emoji: '🍵', color: 0x90EE90 } // Default light green
  }
}

export async function sendDiscordNotification(
  brand: string, 
  products: Array<{name: string, url?: string}>
): Promise<void> {
  // Get brand-specific webhook URL
  const webhookUrl = getBrandWebhookUrl(brand)
  
  if (!webhookUrl) {
    console.log(`⚠️ Discord webhook URL not configured for brand: ${brand}, skipping Discord notification`)
    return
  }

  try {
    const productList = products.map(p => 
      p.url ? `• [${p.name}](${p.url})` : `• ${p.name}`
    ).join('\n')

    // Brand-specific styling
    const brandConfig = getBrandConfig(brand)
    
    const embed: DiscordEmbed = {
      title: `${brandConfig.emoji} ${brand} Restock Alert!`,
      description: `**Products back in stock:**\n${productList}`,
      color: brandConfig.color,
      footer: {
        text: 'MatchaRestock - Instant notifications'
      },
      timestamp: new Date().toISOString()
    }

    const message: DiscordMessage = {
      embeds: [embed]
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    })

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`)
    }

    console.log(`✅ Discord notification sent for ${brand} restock`)
  } catch (error) {
    console.error('❌ Discord notification failed (optional feature):', error)
    // CRITICAL: Don't throw - if Discord fails, email notifications must still work
  }
} 