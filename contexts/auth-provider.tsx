"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"
import type { AuthContextType, AppUser } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// auth context for the app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const supabase = createClient()

  useEffect(() => {

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const appUser = await createAppUser(session.user)
        setUser(appUser)
      }
      setLoading(false)
    }

    getSession()


    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event)
        
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery event detected')
          setShowPasswordReset(true)
        }
        
        if (session?.user) {
          const appUser = await createAppUser(session.user)
          setUser(appUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const createAppUser = async (supabaseUser: User): Promise<AppUser> => {
    // dev mode: auto-subscribe for testing
    // const isDevelopment = process.env.NODE_ENV === 'development'
    
    // check for access code bypass
    const accessCodeEntered = localStorage.getItem('access_code_entered') === 'true'
    
    // Development mode bypass - TEMPORARILY DISABLED FOR TESTING
    if (/* isDevelopment || */ accessCodeEntered) {
      return {
        ...supabaseUser,
        isSubscribed: true,
        subscriptions: [],
      }
    }

    // Check payment subscription status
    let isSubscribed = false
    
    try {
      const response = await fetch('/api/subscriptions')
      if (response.ok) {
        const data = await response.json()
        
        // Check if user has an active payment subscription
        try {
          const paymentResponse = await fetch('/api/payment-subscription-status')
          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json()
            isSubscribed = paymentData.isSubscribed || false
          }
        } catch (paymentError) {
          console.error('Error checking payment subscription:', paymentError)
          // Default to false if payment check fails
          isSubscribed = false
        }

        return {
          ...supabaseUser,
          isSubscribed,
          subscriptions: data.subscriptions || [],
        }
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }

    return {
      ...supabaseUser,
      isSubscribed: false,
      subscriptions: [],
    }
  }

  const signInWithGoogle = async () => {
    // Use canonical domain (non-www) to avoid redirect issues
    const getCanonicalOrigin = () => {
      const { protocol, hostname, port } = window.location
      
      // For localhost, always include the port explicitly
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}${port ? `:${port}` : ''}`
      }
      
      // For production, always use non-www version
      if (hostname === 'www.matcharestock.com') {
        return `${protocol}//matcharestock.com`
      }
      
      // For other domains, use as-is
      return window.location.origin
    }
    
    const canonicalOrigin = getCanonicalOrigin()
    const redirectUrl = `${canonicalOrigin}/auth/callback?next=/dashboard`
    
    console.log('🔗 Canonical origin:', canonicalOrigin)
    console.log('🔗 OAuth redirect URL:', redirectUrl)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: redirectUrl,
      },
    })
    
    if (error) {
      console.error('OAuth error:', error)
      throw error
    } else {
      console.log('OAuth success:', data)
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    // Use canonical domain (non-www) to avoid redirect issues
    const getCanonicalOrigin = () => {
      const { protocol, hostname, port } = window.location
      
      // For localhost, always include the port explicitly
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}${port ? `:${port}` : ''}`
      }
      
      // For production, always use non-www version
      if (hostname === 'www.matcharestock.com') {
        return `${protocol}//matcharestock.com`
      }
      
      // For other domains, use as-is
      return window.location.origin
    }
    
    const canonicalOrigin = getCanonicalOrigin()
    const redirectUrl = `${canonicalOrigin}/auth/callback?next=/dashboard`
    
    console.log('🔗 Email signup redirect URL:', redirectUrl)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })
    
    if (error) {
      console.error('Signup error:', error)
      throw error
    }
    
    return data
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign in error:', error)
      throw error
    }
    
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const deleteAccount = async () => {
    const response = await fetch('/api/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.details || errorData.error || 'Failed to delete account')
    }

    // Clear user state after successful deletion
    setUser(null)
    
    // Clear any local storage items
    localStorage.removeItem('access_code_entered')
  }

  const resetPassword = async (email: string) => {
    const getCanonicalOrigin = () => {
      const { protocol, hostname, port } = window.location
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}${port ? `:${port}` : ''}`
      }
      
      if (hostname === 'www.matcharestock.com') {
        return `${protocol}//matcharestock.com`
      }
      
      return window.location.origin
    }
    
    const canonicalOrigin = getCanonicalOrigin()
    // Redirect to login page - this is more reliable than custom pages
    const redirectUrl = `${canonicalOrigin}/login`
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    
    if (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    })
    
    if (error) {
      console.error('Update password error:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    deleteAccount,
    resetPassword,
    updatePassword,
    showPasswordReset,
    setShowPasswordReset,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
