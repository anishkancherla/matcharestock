import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  console.log('🔐 Email confirmation called')
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Token hash:', token_hash ? 'present' : 'missing')
  console.log('Type:', type)

  if (token_hash && type) {
    try {
      const supabase = await createClient()
      console.log('Supabase client created for confirmation')
      
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })
      
      console.log('Verification result:', error ? 'error' : 'success')
      
      if (error) {
        console.error('Verification error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=verification_failed`)
      }
      
      if (data.user) {
        console.log('✅ User verified:', data.user.id)
        
        // For password recovery, redirect to update password page
        if (type === 'recovery') {
          console.log('🔑 Password recovery confirmed, redirecting to update password page')
          return NextResponse.redirect(`${origin}/auth/update-password`)
        }
        
        // For other confirmations (email signup), redirect to dashboard or next
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err) {
      console.error('Confirmation error:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=exception`)
    }
  }

  console.log('❌ No token_hash or type, redirecting to error')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=missing_token`)
} 