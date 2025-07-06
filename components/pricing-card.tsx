"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "./ui/button"
import { Check } from "lucide-react"

interface PricingCardProps {
  onSubscribe: () => void
}

// pricing card for subscriptions
export default function PricingCard({ onSubscribe }: PricingCardProps) {
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
      <CardFooter>
        <Button className="w-full" onClick={onSubscribe}>
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  )
}
