import type { User } from "@supabase/supabase-js"

// Subscription is now just a brand name
export type Subscription = string

export interface AppUser extends User {
  isSubscribed: boolean
  subscriptions: Subscription[]
}

export interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<any>
  signUpWithEmail: (email: string, password: string) => Promise<any>
  logout: () => void
}

export interface Blend {
  name: string
  description: string
}

export interface BrandData {
  brand: string
  blends: Blend[]
}
