"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import PricingCard from "@/components/pricing-card"
import BrandCard from "@/components/brand-card"
import { toast } from "sonner" // Updated import for sonner
import { matchaBrands } from "@/data/matcha-data"
import DashboardSkeleton from "./loading"

/**
 * The main dashboard page, visible only to authenticated users.
 * It displays a pricing card for non-subscribed users or the brand selector for subscribed users.
 */
export default function DashboardPage() {
  const { user, loading } = useAuth()

  // State now holds an array of brand names
  const [subscriptions, setSubscriptions] = useState<string[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)

  // Load user's current subscriptions when component mounts
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user) {
        setSubscriptionsLoading(false)
        return
      }
      
      try {
        const response = await fetch('/api/subscriptions')
        if (response.ok) {
          const data = await response.json()
          setSubscriptions(data.subscriptions || [])
        }
      } catch (error) {
        console.error('Error loading subscriptions:', error)
      } finally {
        setSubscriptionsLoading(false)
      }
    }

    loadSubscriptions()
  }, [user])

  /**
   * Placeholder function to handle the subscription request.
   */
  const onRequestSubscription = async () => {
    toast("Subscription Request", {
      // Using sonner's toast function
      description: "Redirecting to payment... (This is a placeholder)",
    })
  }

  /**
   * Toggles a subscription for an entire brand.
   * It optimistically updates the UI and then makes an API call.
   */
  const toggleBrand = async (brandName: string) => {
    const isCurrentlySubscribed = subscriptions.includes(brandName)

    const optimisticSubscriptions = isCurrentlySubscribed
      ? subscriptions.filter((b) => b !== brandName)
      : [...subscriptions, brandName]

    setSubscriptions(optimisticSubscriptions)

    try {
      const response = await fetch("/api/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: brandName }),
      })

      console.log('API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error Response:', errorData)
        throw new Error(`Failed to update subscription: ${response.status} ${errorData}`)
      }

      const result = await response.json()
      console.log('API Success:', result)

      toast("Success!", {
        description: `Subscription for ${brandName} updated.`,
      })
    } catch (error) {
      console.error('Full error details:', error)
      toast("Error", {
        description: `Could not update subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
      // Revert to original state on failure
      setSubscriptions(subscriptions)
    }
  }

  /**
   * Checks if a user is subscribed to a specific brand.
   */
  const isBrandSubscribed = (brandName: string) => {
    return subscriptions.includes(brandName)
  }

  if (loading || subscriptionsLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="bg-white min-h-full">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl font-medium tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-2 text-lg text-gray-500">Manage your matcha restock notifications.</p>
        </div>

        {user && !user.isSubscribed ? (
          <PricingCard onSubscribe={onRequestSubscription} />
        ) : (
          <div>
            <h2 className="text-2xl font-medium text-gray-800 mb-6">Your Brands</h2>
            <div className="space-y-10">
              {matchaBrands.map((brandData) => (
                <BrandCard
                  key={brandData.brand}
                  brandData={brandData}
                  isSubscribed={isBrandSubscribed(brandData.brand)}
                  onToggleSubscription={() => toggleBrand(brandData.brand)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
