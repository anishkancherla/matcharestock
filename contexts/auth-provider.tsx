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
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      return {
        ...supabaseUser,
        isSubscribed: true,
        subscriptions: [],
      }
    }


    try {
      const response = await fetch('/api/subscriptions')
      if (response.ok) {
        const data = await response.json()
        return {
          ...supabaseUser,
          isSubscribed: false,
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
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `${window.location.origin}/dashboard`,
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
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
