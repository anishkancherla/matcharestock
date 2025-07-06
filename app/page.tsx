import { Button } from "@/components/ui/button"
import Link from "next/link"

// landing page
export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-white">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl font-gaisyr">MatchaRestock</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Never miss a restock again. Get real-time notifications for your favorite premium matcha blends from Ippodo
          and Marukyu Koyamaen.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/login">Log in / Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
