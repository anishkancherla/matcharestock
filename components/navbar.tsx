"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { LogOut, ShoppingBag } from "lucide-react"

/**
 * The main navigation bar for the application, styled to be minimalist.
 */
export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="bg-white sticky top-0 z-10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between border-b">
          <div className="flex items-center">{/* Placeholder for menu icon */}</div>
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="text-2xl font-medium tracking-wider text-gray-900 font-gaisyr">
              MATCHA
            </Link>
          </div>
          <div className="flex items-center">
            {!loading && user ? (
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-5 w-5 text-gray-600" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className="h-5 w-5 text-gray-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
