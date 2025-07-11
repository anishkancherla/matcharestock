"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff, Lock } from "lucide-react"

export default function PasswordResetModal() {
  const { updatePassword, showPasswordReset, setShowPasswordReset } = useAuth()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
      
      // Close modal and reset form
      setShowPasswordReset(false)
      setNewPassword("")
      setConfirmPassword("")
      
    } catch (error) {
      console.error('Error updating password:', error)
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to update password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!showPasswordReset) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-8 bg-white">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-sage-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Update your password
          </h2>
          <p className="text-gray-600">
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
                className="pr-10"
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
                className="pr-10"
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

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordReset(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-sage-700 hover:bg-sage-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
} 