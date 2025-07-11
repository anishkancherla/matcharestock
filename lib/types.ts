import type { User } from "@supabase/supabase-js"


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
  deleteAccount: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

export interface Blend {
  name: string
  description: string
}

export interface BrandData {
  brand: string
  blends: Blend[]
}
