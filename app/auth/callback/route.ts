import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  console.log('🔐 Auth callback called')
  console.log('Full URL:', request.url)
  console.log('Request headers host:', request.headers.get('host'))
  console.log('Request headers x-forwarded-host:', request.headers.get('x-forwarded-host'))
  console.log('Origin:', new URL(request.url).origin)
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  

  console.log('All search params:')
  for (const [key, value] of searchParams.entries()) {
    console.log(`  ${key}: ${value}`)
  }
  
  console.log('Code:', code ? 'present' : 'missing')
  console.log('Error:', error)
  

  let next = searchParams.get('next') ?? '/dashboard'
  
  if (!next.startsWith('/')) {
  
    next = '/dashboard'
  }
  
  console.log('Next redirect:', next)

  if (code) {
    try {
      const supabase = await createClient()
      console.log('Supabase client created for callback')
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      console.log('Exchange result:', exchangeError ? 'error' : 'success')
      
      if (exchangeError) {
        console.error('Exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=exchange_failed`)
      }
      
      if (data.user) {
        console.log('✅ User authenticated:', data.user.id)
        console.log('Redirecting to:', `${origin}${next}`)
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=exception`)
    }
  }

  console.log('❌ No code or authentication failed, redirecting to error')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=no_code`)
} 