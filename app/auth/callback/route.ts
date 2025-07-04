import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  console.log('🔐 Auth callback called')
  console.log('Full URL:', request.url)
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  // Log ALL search parameters to see what Google is sending
  console.log('All search params:')
  for (const [key, value] of searchParams.entries()) {
    console.log(`  ${key}: ${value}`)
  }
  
  console.log('Code:', code ? 'present' : 'missing')
  console.log('Error:', error)
  
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/dashboard'
  
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
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
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        const redirectUrl = isLocalEnv 
          ? `${origin}${next}` 
          : forwardedHost 
            ? `https://${forwardedHost}${next}` 
            : `${origin}${next}`
            
        console.log('Redirecting to:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      }
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=exception`)
    }
  }

  console.log('❌ No code or authentication failed, redirecting to error')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=no_code`)
} 