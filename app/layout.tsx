import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "MatchaRestock",
  description: "Never miss a restock of your favorite matcha.",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// main app layout with auth and navbar
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={cn("h-full bg-background font-sans antialiased")}>
        <AuthProvider>
          <div className="flex flex-col h-full">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
