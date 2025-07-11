"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff, Lock } from "lucide-react"

export default function UpdatePasswordPage() {
  const { updatePassword, user } = useAuth()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast("Error", {
        description: "Please fill in all fields.",
      })
      return
    }

    if (newPassword.length < 6) {
      toast("Error", {
        description: "Password must be at least 6 characters long.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast("Error", {
        description: "Passwords do not match.",
      })
      return
    }

    try {
      setIsLoading(true)
      await updatePassword(newPassword)
      
      toast("Password updated!", {
        description: "Your password has been successfully updated.",
      })
      
      // Redirect to dashboard after successful update
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error('Error updating password:', error)
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to update password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-sage-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-diatype">
              Update your password
            </h2>
            <p className="mt-2 text-gray-600 font-diatype">
              Choose a new secure password for your account.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10 bg-white border-gray-300 text-black focus:border-sage-700 focus:ring-sage-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10 bg-white border-gray-300 text-black focus:border-sage-700 focus:ring-sage-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-sage-700 hover:bg-sage-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
} 