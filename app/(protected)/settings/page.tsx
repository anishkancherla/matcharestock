"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { 
  ArrowLeft, 
  User, 
  Shield, 
  FileText, 
  CreditCard,
  Mail,
  Lock,
  ExternalLink,
  Trash2
} from "lucide-react"
import DeleteAccountDialog from "@/components/delete-account-dialog"

type TabType = "profile" | "security" | "privacy" | "billing"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [displayName, setDisplayName] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (user?.user_metadata?.display_name) {
      setDisplayName(user.user_metadata.display_name)
    }
  }, [user])



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
      window.location.href = url
    } catch (error) {
      console.error('Customer portal error:', error)
      toast("Error", {
        description: "Failed to open subscription management. Please try again.",
      })
    }
  }

  const tabs = [
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "security" as TabType, label: "Security & Access", icon: Shield },
    { id: "privacy" as TabType, label: "Data & Privacy", icon: FileText },
    { id: "billing" as TabType, label: "Billing", icon: CreditCard },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Personal Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-black">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="mt-1 bg-white border-black text-black"
                  />
                  <p className="mt-1 text-xs text-black">
                    Your email address cannot be changed
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-black pt-6">
              <h3 className="text-lg font-semibold text-black mb-4">Connected Accounts</h3>
              
              <div className="space-y-3">
                {user?.app_metadata?.providers?.includes('google') || user?.identities?.some(i => i.provider === 'google') ? (
                  <div className="flex items-center justify-between p-4 border border-black rounded-lg bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white border border-black rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-black" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-black">Google</p>
                        <p className="text-sm text-black">Connected</p>
                      </div>
                    </div>
                    <span className="text-black text-sm font-medium">Active</span>
                  </div>
                ) : (
                  <div className="text-center py-8 text-black">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-black" />
                    <p>No external accounts connected</p>
                    <p className="text-sm">You're using email and password authentication</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case "security":
        return (
          <div className="space-y-6">
            {/* Only show password section for email/password users, not Google OAuth users */}
            {!(user?.app_metadata?.providers?.includes('google') || user?.identities?.some(i => i.provider === 'google')) && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Password</h3>
                
                <div className="bg-white border border-black rounded-lg p-4">
                  <h4 className="font-medium text-black mb-2">Reset Password</h4>
                  <p className="text-sm text-black mb-4">
                    To reset your password, use the "Forgot password?" link on the login page. 
                    You'll receive an email with instructions to update your password.
                  </p>
                  <Link href="/auth/reset-password">
                    <Button
                      variant="outline"
                      className="border-black text-black hover:bg-gray-100"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="border-t border-black pt-6">
              <h3 className="text-lg font-semibold text-black mb-4">Account Actions</h3>
              
              <div className="bg-white border border-black rounded-lg p-4">
                <h4 className="font-semibold text-black mb-2">Delete Account</h4>
                <p className="text-sm text-black mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Privacy & Data</h3>
              <p className="text-black mb-6">
                Learn about how we handle your data and understand your rights.
              </p>
              
                              <div className="space-y-4">
                <div className="border border-black rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-black">Privacy Policy</h4>
                      <p className="text-sm text-black">
                        Understand how we collect, use, and protect your personal information.
                      </p>
                    </div>
                    <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="border-black text-black hover:bg-gray-100">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Policy
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="border border-black rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-black">Terms of Service</h4>
                      <p className="text-sm text-black">
                        Understand your rights and responsibilities when using our platform.
                      </p>
                    </div>
                    <Link href="/terms-of-service" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="border-black text-black hover:bg-gray-100">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Terms
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-black pt-6">
              <h3 className="text-lg font-semibold text-black mb-4">Data Management</h3>
              
              <div className="space-y-4">
                <div className="bg-white border border-black rounded-lg p-4">
                  <h4 className="font-medium text-black mb-2">Your Data</h4>
                  <p className="text-sm text-black mb-3">
                    We collect minimal data to provide our restock notification service:
                  </p>
                  <ul className="text-sm text-black space-y-1">
                    <li>• Email address for account creation and notifications</li>
                    <li>• Brand subscription preferences</li>
                    <li>• Payment information (processed securely by Stripe)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case "billing":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Subscription Management</h3>
              
              <div className="space-y-4">
                <div className="border border-black rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-black">Current Plan</h4>
                      <p className="text-sm text-black">
                        {user?.isSubscribed ? "MatchaRestock Premium - $3.50/month" : "Free Plan"}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user?.isSubscribed 
                        ? 'bg-white border border-black text-black' 
                        : 'bg-white border border-black text-black'
                    }`}>
                      {user?.isSubscribed ? "Active" : "Free"}
                    </span>
                  </div>
                </div>

                {user?.isSubscribed && (
                  <div className="border border-black rounded-lg p-4 bg-white">
                    <h4 className="font-medium text-black mb-2">Manage Subscription</h4>
                    <p className="text-sm text-black mb-4">
                      Update your billing information, change your plan, or cancel your subscription.
                    </p>
                    <Button
                      onClick={onManageSubscription}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </div>
                )}

                <div className="bg-white border border-black rounded-lg p-4">
                  <h4 className="font-medium text-black mb-2">Billing Information</h4>
                  <p className="text-sm text-black">
                    All billing is securely processed by Stripe. We don't store your payment information on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-6 border-b border-black bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-black hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-black font-diatype">Settings</h1>
            <p className="text-black font-diatype">
              Manage your account preferences and security settings.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 bg-white">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors border ${
                      activeTab === tab.id
                        ? 'bg-white border-black text-black font-medium'
                        : 'text-black hover:bg-gray-100 border-transparent'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <Card className="p-6 bg-white border border-black">
              {renderTabContent()}
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </div>
  )
} 