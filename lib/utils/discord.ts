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

export async function sendDiscordNotification(
  brand: string, 
  products: Array<{name: string, url?: string}>
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.log('⚠️ Discord webhook URL not configured, skipping Discord notification')
    return
  }

  try {
    const productList = products.map(p => 
      p.url ? `• [${p.name}](${p.url})` : `• ${p.name}`
    ).join('\n')

    const embed: DiscordEmbed = {
      title: `🍵 ${brand} Restock Alert!`,
      description: `**Products back in stock:**\n${productList}`,
      color: 0x90EE90, // Light green
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