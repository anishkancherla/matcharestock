"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

/**
 * A form for handling user authentication with email/password and Google OAuth.
 */
export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      
      toast("Signing in with Google...", {
        description: "Redirecting you to Google.",
      })
    } catch (error) {
      console.error('Error signing in with Google:', error)
      toast("Error signing in", {
        description: "Please try again.",
      })
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast("Error", {
        description: "Please fill in all fields.",
      })
      return
    }

    try {
      setIsLoading(true)
      
      if (isSignUp) {
        const data = await signUpWithEmail(email, password)
        console.log('Signup result:', {
          userCreated: !!data.user,
          sessionCreated: !!data.session,
          userId: data.user?.id,
          emailConfirmed: data.user?.email_confirmed_at,
          identities: data.user?.identities?.length
        })
        
        if (data.user && !data.session) {
          toast("Check your email!", {
            description: "We sent you a confirmation link to complete your signup.",
          })
        } else if (data.user && data.session) {
          toast("Account created!", {
            description: "Welcome to MatchaRestock! You're already signed in.",
          })
        } else {
          toast("Signup initiated!", {
            description: "Please check your email for confirmation.",
          })
        }
      } else {
        await signInWithEmail(email, password)
        toast("Welcome back!", {
          description: "You've been signed in successfully.",
        })
      }
      
      // Clear form
      setEmail("")
      setPassword("")
      
    } catch (error: any) {
      console.error('Auth error:', error)
      toast("Error", {
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="mt-2 text-gray-600">
          {isSignUp 
            ? "Sign up for MatchaRestock to get started" 
            : "Sign in to your MatchaRestock account"
          }
        </p>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            disabled={isLoading}
            minLength={6}
          />
        </div>

        <Button 
          type="submit"
          className="w-full" 
          disabled={isLoading}
          size="lg"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSignUp ? "Create Account" : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <Button 
        onClick={handleGoogleSignIn} 
        variant="outline"
        className="w-full" 
        disabled={isLoading}
        size="lg"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue with Google
      </Button>

      {/* Toggle between Sign In / Sign Up */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-blue-600 hover:text-blue-500"
          disabled={isLoading}
        >
          {isSignUp 
            ? "Already have an account? Sign in" 
            : "Don't have an account? Sign up"
          }
        </button>
      </div>
    </div>
  )
}
