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
    <div className="max-w-lg mx-auto">
      <Card className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold text-gray-900 font-gaisyr">Unlock All Features</CardTitle>
          <CardDescription className="text-lg text-gray-600 font-diatype mt-4">
            Subscribe to get real-time restock notifications for unlimited blends.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 font-gaisyr">
              $5<span className="text-xl font-normal text-gray-600 font-diatype">/month</span>
            </div>
          </div>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-center text-base font-diatype">
              <Check className="mr-3 h-5 w-5 text-sage-600 flex-shrink-0" />
              Unlimited blend subscriptions
            </li>
            <li className="flex items-center text-base font-diatype">
              <Check className="mr-3 h-5 w-5 text-sage-600 flex-shrink-0" />
              Real-time email notifications
            </li>
            <li className="flex items-center text-base font-diatype">
              <Check className="mr-3 h-5 w-5 text-sage-600 flex-shrink-0" />
              Cancel anytime
            </li>
          </ul>
        </CardContent>
        <CardFooter className="flex-col space-y-4 px-8 pb-8">
          <Button 
            className="w-full h-12 bg-sage-600 hover:bg-sage-700 text-white font-medium font-diatype text-lg" 
            onClick={onSubscribe}
          >
            Subscribe Now
          </Button>
          
          {!showAccessCode ? (
            <button
              onClick={() => setShowAccessCode(true)}
              className="text-sm text-gray-500 hover:text-gray-700 underline font-diatype"
            >
              Have an access code?
            </button>
          ) : (
            <div className="w-full space-y-3">
              <Input
                type="text"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-sm bg-white/50 border-white/40 focus:bg-white/70"
              />
              <div className="flex space-x-3">
                <Button
                  onClick={handleAccessCode}
                  size="sm"
                  className="flex-1 bg-sage-600 hover:bg-sage-700 font-diatype"
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
                  className="flex-1 border-white/40 bg-white/20 hover:bg-white/30 font-diatype"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
