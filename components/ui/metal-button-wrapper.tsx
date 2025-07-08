import React from 'react'
import { Check } from 'lucide-react'
import './metal-button-styles.css'

interface MetalButtonWrapperProps {
  title: string
  isSubscribed?: boolean
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  icon?: React.ReactNode
}

interface MetalCircleButtonProps {
  number: string | number
  className?: string
}

export function MetalButtonWrapper({ 
  title, 
  isSubscribed = false,
  onClick, 
  className = "", 
  style = {},
  icon
}: MetalButtonWrapperProps) {
  return (
    <div className="flex items-center">
      {/* Metal button with text directly on it */}
      <button 
        onClick={onClick}
        className={`metal-button ${isSubscribed ? 'metal-button-active' : ''} ${className}`}
        style={style}
      >
        {isSubscribed ? (
          <span className="text-sm font-medium relative z-10 text-white">Unsubscribe</span>
        ) : (
          <div className="flex items-center space-x-2 relative z-10">
            <span className="text-sm font-medium">{title}</span>
            {icon && icon}
          </div>
        )}
      </button>
    </div>
  )
}

export function MetalCircleButton({ number, className = "" }: MetalCircleButtonProps) {
  return (
    <div className={`metal-circle-button ${className}`}>
      <span className="text-white font-bold relative z-10">{number}</span>
    </div>
  )
} 