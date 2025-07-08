"use client"

import AuthForm from "@/components/auth-form"
import { useSearchParams } from "next/navigation"

export default function LoginContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  
  return (
    <div className="min-h-screen bg-white">
      {/* Main content - centered vertically */}
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          <AuthForm mode={mode} />
        </div>
      </div>
    </div>
  )
} 