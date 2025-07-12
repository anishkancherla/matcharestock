import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          supabaseResponse.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          supabaseResponse.cookies.set(name, '', {
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  // refresh session if needed
  const { data: { user }, error } = await supabase.auth.getUser()

  // Protect dashboard and other protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/settings')) {
    if (!user || error) {
      // Redirect to login if not authenticated
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages, but allow auth callbacks to complete
  if (user && !error) {
    if (request.nextUrl.pathname.startsWith('/login') || 
        (request.nextUrl.pathname.startsWith('/auth/') && 
         !request.nextUrl.pathname.startsWith('/auth/callback') &&
         !request.nextUrl.pathname.startsWith('/auth/confirm') &&
         !request.nextUrl.pathname.startsWith('/auth/update-password'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match request paths for authentication and protected routes:
     * - /dashboard (protected)
     * - /settings (protected)
     * - /login (auth)
     * - /auth/ (auth callbacks)
     * Exclude static files, API routes, and public legal pages
     */
    '/dashboard/:path*',
    '/settings/:path*',
    '/login',
    '/auth/:path*',
  ],
} 