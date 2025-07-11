"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface DeleteAccountDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const { deleteAccount, user } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [step, setStep] = useState<"warning" | "confirm">("warning")

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      
      await deleteAccount()
      
      toast("Account deleted successfully", {
        description: "Your account and all associated data have been permanently deleted.",
      })
      
      onClose()
      router.push('/')
      
    } catch (error) {
      console.error('Error deleting account:', error)
      toast("Failed to delete account", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const isConfirmationValid = confirmationText === "DELETE MY ACCOUNT"

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 bg-white">
        {step === "warning" ? (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">⚠️ Delete Account</h2>
              <p className="text-gray-600">
                This action cannot be undone. This will permanently delete your account and remove all your data.
              </p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">What will be deleted:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Your account and login credentials</li>
                <li>• All matcha brand subscriptions</li>
                <li>• Payment subscription data</li>
                <li>• All notification preferences</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Note:</h3>
              <p className="text-sm text-yellow-700">
                If you have an active paid subscription, it will be automatically cancelled. 
                You may still be charged for the current billing period.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">🚨 Final Confirmation</h2>
              <p className="text-gray-600 mb-4">
                Type <span className="font-mono font-bold">"DELETE MY ACCOUNT"</span> to confirm deletion.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation">Confirmation</Label>
              <Input
                id="confirmation"
                type="text"
                placeholder="DELETE MY ACCOUNT"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="font-mono"
                autoComplete="off"
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user?.email}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep("warning")
                  setConfirmationText("")
                }}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Back
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={!isConfirmationValid || isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Account Forever"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
} 