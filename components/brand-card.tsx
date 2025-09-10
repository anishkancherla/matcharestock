import type { BrandData } from "@/lib/types"

interface BrandCardProps {
  brandData: BrandData
  isSubscribed: boolean
  onToggleSubscription: () => void
}

// brand card with subscription toggle
export default function BrandCard({ brandData, isSubscribed, onToggleSubscription }: BrandCardProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0 font-diatype-mono">{brandData.brand}</h3>
        <button 
          onClick={onToggleSubscription}
          className={`px-4 py-2 rounded-full transition-colors flex items-center space-x-1.5 ${
            isSubscribed 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-black hover:bg-gray-800 text-white'
          }`}
        >
          <span className="text-sm font-medium">
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </span>
        </button>
      </div>
      
      {/* Clean blend list */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 font-diatype">Blends tracked:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {brandData.blends.map((blend) => (
            <div 
              key={blend.name}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center hover:bg-gray-100 transition-all duration-200"
            >
              <span className="text-sm font-medium text-gray-800 font-diatype">{blend.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
