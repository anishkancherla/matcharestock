"use client"

import { useContext } from "react"
import { AuthContext } from "@/contexts/auth-provider"
import type { AuthContextType } from "@/lib/types"

/**
 * Custom hook to easily access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
