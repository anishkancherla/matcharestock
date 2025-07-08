import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// protected routes layout
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // If no user or auth error, redirect to login
  if (error || !user) {
    redirect('/login')
  }
  
  return <>{children}</>
}
