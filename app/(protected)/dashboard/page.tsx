"use client"

import { useState, useEffect, useRef } from "react"
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


// main dashboard page
export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [subscriptions, setSubscriptions] = useState<string[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

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

  // Handle clicking outside settings dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error during logout:', error)
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

  if (loading || subscriptionsLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-200 via-sage-100 to-sage-300 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-sage-300/50 via-sage-200/30 to-sage-400/40"></div>
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-semibold text-gray-900 font-diatype">matcharestock</span>
        </Link>
        
        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-gray-700 font-diatype">{user.email}</span>
          )}
          
          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 backdrop-blur-xl bg-white/20 border border-white/30 text-gray-900 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
            
            {settingsOpen && (
              <div className="absolute -right-16 mt-2 w-56 backdrop-blur-xl bg-white/90 border border-white/40 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <button
                    onClick={async () => {
                      try {
                        await onManageSubscription()
                        setSettingsOpen(false)
                      } catch (error) {
                        setSettingsOpen(false)
                      }
                    }}
                    className="flex items-center justify-center w-full px-4 py-2 text-gray-700 hover:bg-white/50 font-diatype transition-colors"
                  >
                    Manage Subscription
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Icon */}
          <button 
            onClick={handleLogout}
            className="p-2 backdrop-blur-xl bg-white/20 border border-white/30 text-gray-900 hover:bg-white/30 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 pb-12">
        <div className="container mx-auto max-w-6xl">
          {user && !user.isSubscribed ? (
            <PricingCard onSubscribe={onRequestSubscription} />
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
