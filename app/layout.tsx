import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-provider"
import Navbar from "@/components/navbar"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner" // Updated import for sonner

export const metadata: Metadata = {
  title: "MatchaRestock",
  description: "Never miss a restock of your favorite matcha.",
}

/**
 * Root layout for the entire application.
 * It wraps all pages with the AuthProvider for session management and includes the Navbar.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={cn("h-full bg-gray-50 font-sans antialiased")}>
        <AuthProvider>
          <div className="flex flex-col h-full">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster /> {/* Using sonner's Toaster component */}
        </AuthProvider>
      </body>
    </html>
  )
}
