import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Override the signInWithOAuth method to force localhost redirects in development
  const originalSignInWithOAuth = client.auth.signInWithOAuth.bind(client.auth)
  
  client.auth.signInWithOAuth = async (credentials) => {
    // Force localhost redirect in development, regardless of Supabase Site URL
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const { hostname, port, protocol } = window.location
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const localOrigin = `${protocol}//${hostname}${port ? `:${port}` : ''}`
        
        // Override redirectTo to always use localhost in development
        if (credentials.options?.redirectTo) {
          const originalRedirectTo = credentials.options.redirectTo
          const redirectPath = new URL(originalRedirectTo).pathname + new URL(originalRedirectTo).search
          credentials.options.redirectTo = `${localOrigin}${redirectPath}`
          
          console.log('🔧 Development mode: Overriding redirectTo to:', credentials.options.redirectTo)
        }
      }
    }
    
    return originalSignInWithOAuth(credentials)
  }

  // Override signUp method for email signup redirects
  const originalSignUp = client.auth.signUp.bind(client.auth)
  
  client.auth.signUp = async (credentials) => {
    // Force localhost redirect in development for email confirmations
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const { hostname, port, protocol } = window.location
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const localOrigin = `${protocol}//${hostname}${port ? `:${port}` : ''}`
        
        // Override emailRedirectTo to always use localhost in development
        if (credentials.options && 'emailRedirectTo' in credentials.options && credentials.options.emailRedirectTo) {
          const originalRedirectTo = credentials.options.emailRedirectTo
          const redirectPath = new URL(originalRedirectTo).pathname + new URL(originalRedirectTo).search
          credentials.options.emailRedirectTo = `${localOrigin}${redirectPath}`
          
          console.log('🔧 Development mode: Overriding emailRedirectTo to:', credentials.options.emailRedirectTo)
        }
      }
    }
    
    return originalSignUp(credentials)
  }

  return client
}

export const supabase = createClient() 