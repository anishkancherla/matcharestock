"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast("Error", {
        description: "Please enter your email address.",
      })
      return
    }

    try {
      setIsLoading(true)
      await resetPassword(email)
      setEmailSent(true)
      
      toast("Reset link sent!", {
        description: "Check your email for a password reset link.",
      })
      
    } catch (error) {
      console.error('Error sending reset email:', error)
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to send reset email. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Back to login link */}
        <div>
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Link>
        </div>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-sage-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-diatype">
              Reset your password
            </h2>
            <p className="mt-2 text-gray-600 font-diatype">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="mt-1 bg-white border-gray-300 text-black focus:border-sage-700 focus:ring-sage-700"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-sage-700 hover:bg-sage-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Email sent!</h3>
                <p className="text-sm text-green-700">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Click the link in your email to reset your password.
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail("")
                  }}
                  className="text-sage-700 hover:text-sage-800 font-medium"
                >
                  try again
                </button>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
} 