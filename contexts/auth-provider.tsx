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
    console.log('🔍 Environment Debug Info:')
    console.log('- window.location.origin:', window.location.origin)
    console.log('- window.location.href:', window.location.href)
    console.log('- window.location.host:', window.location.host)
    console.log('- window.location.hostname:', window.location.hostname)
    console.log('- window.location.protocol:', window.location.protocol)
    
    const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`
    console.log('🔗 Final OAuth redirect URL:', redirectUrl)
    
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
    const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`
    console.log('Email signup redirect URL:', redirectUrl)
    
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

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
