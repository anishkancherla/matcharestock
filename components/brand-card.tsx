import type { BrandData } from "@/lib/types"
import ProductCard from "./product-card"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"

interface BrandCardProps {
  brandData: BrandData
  isSubscribed: boolean
  onToggleSubscription: () => void
}

/**
 * A card that displays a brand and its list of blends.
 * It includes a toggle to subscribe to all notifications for that brand.
 */
export default function BrandCard({ brandData, isSubscribed, onToggleSubscription }: BrandCardProps) {
  return (
    <div className="border border-gray-200/80 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-6 border-b">
        <h3 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">{brandData.brand}</h3>
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <Label htmlFor={`toggle-${brandData.brand}`} className="text-gray-700 font-medium">
            Notify me for all blends
          </Label>
          <Switch
            id={`toggle-${brandData.brand}`}
            checked={isSubscribed}
            onCheckedChange={onToggleSubscription}
            aria-label={`Subscribe to notifications for ${brandData.brand}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        {brandData.blends.map((blend) => (
          <ProductCard key={blend.name} blend={blend.name} description={blend.description} />
        ))}
      </div>
    </div>
  )
}
