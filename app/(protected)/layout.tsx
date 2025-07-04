import type { ReactNode } from "react"

/**
 * Layout for protected routes.
 * The server-side check is disabled for UI preview.
 */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
