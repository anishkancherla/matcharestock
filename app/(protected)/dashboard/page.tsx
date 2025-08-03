"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import PricingCard from "@/components/pricing-card"
import BrandCard from "@/components/brand-card"
import { toast } from "sonner"
import { matchaBrands } from "@/data/matcha-data"
import DashboardSkeleton from "./loading"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Settings, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"


// main dashboard page
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [subscriptions, setSubscriptions] = useState<string[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

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



  // Handle Stripe checkout success/cancel
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')

    if (success === 'true') {
      toast("Payment Successful! 🎉", {
        description: "Your subscription is now active. You can now set up brand notifications!",
      })
      // Clean up URL
      router.replace('/dashboard')
    } else if (canceled === 'true') {
      toast("Payment Canceled", {
        description: "Your payment was canceled. You can try again anytime.",
      })
      // Clean up URL
      router.replace('/dashboard')
    }
  }, [searchParams, router])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error during logout:', error)
      setLoggingOut(false)
      toast("Error", {
        description: "Failed to sign out. Please try again.",
      })
    }
  }

  const onRequestSubscription = async () => {
    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      // Redirect to Stripe Checkout
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Stripe redirect error:', error)
          toast("Error", {
            description: "Failed to redirect to checkout. Please try again.",
          })
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast("Error", {
        description: "Failed to start checkout process. Please try again.",
      })
    }
  }

  const onManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create customer portal session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Customer Portal
      window.location.href = url
    } catch (error) {
      console.error('Customer portal error:', error)
      toast("Error", {
        description: "Failed to open subscription management. Please try again.",
      })
    }
  }

  // toggle brand subscription
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

      setSubscriptions(subscriptions)
    }
  }

  const isBrandSubscribed = (brandName: string) => {
    return subscriptions.includes(brandName)
  }

  if (loading || subscriptionsLoading || loggingOut) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      
      {/* Header - always show but with different styling */}
      <header className="relative z-10 px-6 py-6 lg:px-12">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-start justify-between">
            {/* Logo and Email */}
            <div>
              <Link href="/" className="text-xl font-semibold text-gray-900 font-diatype-mono">
                matcharestock
              </Link>
              {user && (
                <div className="text-sm text-gray-700 font-diatype mt-1">
                  {user.email}
                </div>
              )}
            </div>
            
            {/* Right side buttons */}
            <div className="flex items-center space-x-2">
              {/* Settings Link - only show when subscribed */}
              {user && user.isSubscribed && (
                <Link
                  href="/settings"
                  className="p-2 bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              )}

              {/* Sign Out Icon */}
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-900 rounded-lg transition-colors bg-gray-100 border border-gray-300 hover:bg-gray-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-gray-900 font-diatype-mono">matcharestock</span>
          </Link>
          
          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-gray-700 font-diatype">{user.email}</span>
            )}
            
            {/* Settings Link - only show when subscribed */}
            {user && user.isSubscribed && (
              <Link
                href="/settings"
                className="p-2 bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
              </Link>
            )}

            {/* Sign Out Icon */}
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-900 rounded-lg transition-colors bg-gray-100 border border-gray-300 hover:bg-gray-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`relative z-10 ${user && user.isSubscribed ? 'px-6 lg:px-12 pb-12' : ''}`}>
        <div className={`${user && user.isSubscribed ? 'container mx-auto max-w-6xl' : ''}`}>
          {user && !user.isSubscribed ? (
            <PricingCard 
              onSubscribe={onRequestSubscription} 
              userEmail={user.email}
              onExit={() => router.push('/')}
              showMobileHeader={false}
            />
          ) : (
            <div className="space-y-8">
              {/* Brand Cards */}
              {matchaBrands.map((brandData) => (
                <BrandCard
                  key={brandData.brand}
                  brandData={brandData}
                  isSubscribed={isBrandSubscribed(brandData.brand)}
                  onToggleSubscription={() => toggleBrand(brandData.brand)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
