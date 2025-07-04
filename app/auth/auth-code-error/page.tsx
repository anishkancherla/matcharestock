import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">
          Something went wrong during the sign-in process. This could be due to:
        </p>
        <ul className="text-left text-gray-600 space-y-1">
          <li>• Expired or invalid authorization code</li>
          <li>• Network connectivity issues</li>
          <li>• Configuration problems</li>
        </ul>
        <div className="space-y-2">
          <Button asChild>
            <Link href="/login">Try Again</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 