import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  console.log('🔐 Auth confirm called')
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Token hash:', token_hash ? 'present' : 'missing')
  console.log('Type:', type)

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      console.log('✅ OTP verified successfully')
      
      // For password recovery, redirect to update password page
      if (type === 'recovery') {
        console.log('🔑 Password recovery confirmed, redirecting to update password page')
        redirect('/auth/update-password')
      }
      
      // For other types (signup, etc), redirect to next or dashboard
      redirect(next)
    }
    
    console.error('❌ OTP verification error:', error)
  }

  // Redirect to error page if no token or verification failed
  console.log('❌ No token_hash/type or verification failed, redirecting to error')
  redirect('/auth/auth-code-error?reason=verification_failed')
} 