import type { ReactNode } from "react"

// protected routes layout
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
