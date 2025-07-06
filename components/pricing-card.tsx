"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Check } from "lucide-react"
import { useState } from "react"

interface PricingCardProps {
  onSubscribe: () => void
}

// pricing card for subscriptions
export default function PricingCard({ onSubscribe }: PricingCardProps) {
  const [accessCode, setAccessCode] = useState('')
  const [showAccessCode, setShowAccessCode] = useState(false)

  const handleAccessCode = async () => {
    try {
      const response = await fetch('/api/access-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.valid) {
          localStorage.setItem('access_code_entered', 'true')
          window.location.reload() // refresh to apply bypass
        } else {
          alert('Invalid access code')
          setAccessCode('')
        }
      } else {
        alert('Invalid access code')
        setAccessCode('')
      }
    } catch (error) {
      alert('Error validating access code')
      setAccessCode('')
    }
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Unlock All Features</CardTitle>
        <CardDescription>Subscribe to get real-time restock notifications for unlimited blends.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl font-bold">
          $5<span className="text-base font-normal text-gray-500">/month</span>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Unlimited blend subscriptions
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Real-time email notifications
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Cancel anytime
          </li>
        </ul>
      </CardContent>
      <CardFooter className="flex-col space-y-4">
        <Button className="w-full" onClick={onSubscribe}>
          Subscribe Now
        </Button>
        
        {!showAccessCode ? (
          <button
            onClick={() => setShowAccessCode(true)}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Have an access code?
          </button>
        ) : (
          <div className="w-full space-y-2">
            <Input
              type="text"
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="text-sm"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleAccessCode}
                size="sm"
                className="flex-1"
              >
                Submit
              </Button>
              <Button
                onClick={() => {
                  setShowAccessCode(false)
                  setAccessCode('')
                }}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
