import { Suspense } from "react"
import AuthForm from "@/components/auth-form"
import LoginContent from "./login-content"

// login page
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
