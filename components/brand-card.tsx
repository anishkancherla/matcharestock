import type { BrandData } from "@/lib/types"
import { MetalButtonWrapper } from "./ui/metal-button-wrapper"

interface BrandCardProps {
  brandData: BrandData
  isSubscribed: boolean
  onToggleSubscription: () => void
}

// brand card with subscription toggle
export default function BrandCard({ brandData, isSubscribed, onToggleSubscription }: BrandCardProps) {
  return (
    <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl hover:bg-white/25 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 pb-6 border-b border-white/20">
        <h3 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0 font-gaisyr">{brandData.brand}</h3>
        <MetalButtonWrapper
          title="Subscribe"
          isSubscribed={isSubscribed}
          onClick={onToggleSubscription}
        />
      </div>
      
      {/* Clean blend list */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 font-diatype">Blends we track:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {brandData.blends.map((blend) => (
            <div 
              key={blend.name}
              className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl px-4 py-3 text-center hover:bg-white/40 transition-all duration-200"
            >
              <span className="text-sm font-medium text-gray-800 font-diatype">{blend.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
