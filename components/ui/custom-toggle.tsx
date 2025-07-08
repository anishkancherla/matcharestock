import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  "aria-label"?: string
  disabled?: boolean
}

const CustomToggle = React.forwardRef<HTMLButtonElement, CustomToggleProps>(
  ({ checked, onCheckedChange, id, "aria-label": ariaLabel, disabled = false }, ref) => {
    return (
      <div className="flex items-center space-x-4 bg-white border border-gray-200 rounded-full px-6 py-3 shadow-sm">
        {/* Text Label */}
        <span className="text-orange-600 font-medium font-diatype text-sm">
          Subscribe
        </span>
        
        {/* Toggle Switch */}
        <button
          ref={ref}
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            checked
              ? "bg-gradient-to-r from-sage-700 to-sage-400"
              : "bg-gray-300"
          )}
        >
          {/* Thumb */}
          <span
            className={cn(
              "pointer-events-none inline-block h-7 w-7 transform rounded-full transition duration-300 ease-in-out",
              "bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300",
              "shadow-lg border border-gray-300",
              "relative",
              // 3D metallic effect with inner shadows and highlights
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/40 before:via-transparent before:to-black/10",
              "after:absolute after:inset-0.5 after:rounded-full after:bg-gradient-to-b after:from-white/60 after:to-transparent",
              checked ? "translate-x-6" : "translate-x-0.5"
            )}
            style={{
              top: "2px",
              boxShadow: checked 
                ? "inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.2)"
                : "inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            {/* Icon inside thumb */}
            {checked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-4 w-4 text-yellow-600" strokeWidth={3} />
              </div>
            )}
          </span>
        </button>
      </div>
    )
  }
)

CustomToggle.displayName = "CustomToggle"

export { CustomToggle } 