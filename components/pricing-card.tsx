"use client"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"
import { MetalButtonWrapper } from "./ui/metal-button-wrapper"

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
    <div className="h-[calc(100vh-120px)] bg-white flex items-center justify-center px-6 overflow-hidden">
      <div className="max-w-2xl w-[90%] mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8 font-diatype">
          Unlock Access
        </h2>
        <div 
          className="p-12 transition-all duration-300 relative border border-gray-300"
          style={{
            borderRadius: '24px',
          }}
        >
          <div className="relative z-10">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-black font-diatype-mono mb-2">
                  $3.50<span className="text-xl font-normal text-black font-diatype">/month</span>
                </div>
                <p className="text-black font-diatype-thin">Everything you need to never miss a restock</p>
              </div>
              <ul className="space-y-4 text-left mb-8">
                <li className="flex items-center text-black font-diatype-thin">
                  <div className="w-2 h-2 bg-sage-600 rounded-full mr-3"></div>
                  Unlimited brand subscriptions
                </li>
                <li className="flex items-center text-black font-diatype-thin">
                  <div className="w-2 h-2 bg-sage-600 rounded-full mr-3"></div>
                  Real-time email notifications
                </li>
                <li className="flex items-center text-black font-diatype-thin">
                  <div className="w-2 h-2 bg-sage-600 rounded-full mr-3"></div>
                  Cancel anytime
                </li>
              </ul>
              <div className="mb-6">
                <MetalButtonWrapper
                  title="Subscribe Now"
                  isSubscribed={false}
                  onClick={onSubscribe}
                  className="w-full"
                />
              </div>
              
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
                    className="text-sm"
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
                      className="flex-1 font-diatype"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
