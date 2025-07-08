interface ProductCardProps {
  blend: string
  description: string
}

// matcha blend card
export default function ProductCard({ blend, description }: ProductCardProps) {
  return (
    <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:bg-white/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <h4 className="text-xl font-bold text-gray-800 mb-3 font-gaisyr leading-tight">{blend}</h4>
      <p className="text-sm text-gray-600 font-diatype leading-relaxed">{description}</p>
    </div>
  )
}
