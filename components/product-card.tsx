interface ProductCardProps {
  blend: string
  description: string
}

/**
 * A simple display card for a single matcha blend, showing its name and description.
 */
export default function ProductCard({ blend, description }: ProductCardProps) {
  return (
    <div>
      <h4 className="text-lg font-medium text-gray-800">{blend}</h4>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  )
}
