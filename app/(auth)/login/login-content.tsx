"use client"

import Link from "next/link"
import AuthForm from "@/components/auth-form"
import { Leaf } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function LoginContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-200 via-sage-100 to-sage-300 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-sage-300/50 via-sage-200/30 to-sage-400/40"></div>
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center space-x-2">
          <Leaf className="w-6 h-6 text-sage-600" />
          <span className="text-xl font-semibold text-gray-900 font-diatype">matcharestock</span>
        </Link>
      </header>

      {/* Main content */}
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          <AuthForm mode={mode} />
        </div>
      </div>
    </div>
  )
} 