"use client"

import { useContext } from "react"
import { AuthContext } from "@/contexts/auth-provider"
import type { AuthContextType } from "@/lib/types"

// auth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
