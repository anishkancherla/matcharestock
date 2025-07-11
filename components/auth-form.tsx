"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AuthFormProps {
  mode?: 'signin' | 'signup'
}

// login/signup form with google oauth
export default function AuthForm({ mode = 'signin' }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(mode === 'signup')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const router = useRouter()

  const handleToggleMode = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setIsSignUp(!isSignUp)
      setAcceptTerms(false) // Reset terms acceptance when switching modes
      setIsTransitioning(false)
    }, 150)
  }

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

    if (isSignUp && !acceptTerms) {
      toast("Error", {
        description: "Please accept the Terms of Service and Privacy Policy to continue.",
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
        
        // Check if this might be an existing user
        if (data.user && !data.session && data.user.identities && data.user.identities.length > 0) {
          // User exists but no session was created - likely already registered
          const hasGoogleIdentity = data.user.identities.some((identity: any) => identity.provider === 'google')
          
          if (hasGoogleIdentity) {
            toast("Account already exists!", {
              description: "This email is registered with Google. Please use 'Continue with Google' to sign in.",
            })
          } else {
            toast("Account already exists!", {
              description: "This email is already registered. Please try logging in instead.",
            })
          }
        } else if (data.user && !data.session) {
          // New user signup - needs email confirmation
          toast("Check your email!", {
            description: "We sent you a confirmation link to complete your signup.",
          })
        } else if (data.user && data.session) {
          // New user signup with immediate session (auto-confirmed)
          toast("Account created!", {
            description: "Welcome to MatchaRestock! Redirecting to dashboard...",
          })

          setTimeout(() => router.push('/dashboard'), 1000)
        } else {
          // Fallback case
          toast("Signup initiated!", {
            description: "Please check your email for confirmation.",
          })
        }
      } else {
        await signInWithEmail(email, password)
        toast("Welcome back!", {
          description: "You've been signed in successfully. Redirecting...",
        })

        setTimeout(() => router.push('/dashboard'), 1000)
      }
      

      setEmail("")
      setPassword("")
      
    } catch (error: any) {
      console.error('Auth error:', error)
      

      let errorTitle = "Error"
      let errorDescription = "Something went wrong. Please try again."
      
      if (error.message) {
        if (error.message.includes("User already registered") || 
            error.message.includes("already been registered")) {
          errorTitle = "Account Already Exists"
          if (isSignUp) {
            errorDescription = "This email is already registered. Please try logging in instead, or use 'Continue with Google' if you signed up with Google."
          } else {
            errorDescription = "This email is already registered. If you signed up with Google, please choose 'Continue with Google' to access your account."
          }
        }
        else if (error.message.includes("Invalid login credentials")) {
          if (isSignUp) {
            errorTitle = "Account Already Exists" 
            errorDescription = "This email is already registered with a different password. Please try logging in instead."
          } else {
            errorTitle = "Incorrect Password"
            errorDescription = "The password you entered is incorrect. If you signed up with Google, please use 'Continue with Google' instead."
          }
        }
        else if (error.message.includes("Email not confirmed")) {
          errorTitle = "Email Not Confirmed"
          errorDescription = "Please check your email and click the confirmation link before signing in."
        }
        else if (error.message.includes("signup_disabled") || error.message.includes("Signup disabled")) {
          errorTitle = "Signup Temporarily Disabled"
          errorDescription = "Account creation is temporarily disabled. Please try again later."
        }
        else {
          errorDescription = error.message
        }
      }
      
      toast(errorTitle, {
        description: errorDescription,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div 
        className={`text-left transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-50 transform translate-y-1' : 'opacity-100 transform translate-y-0'
        }`}
      >
        <h2 className="text-2xl font-semibold text-gray-900">
          {isSignUp ? "Create an account" : "Welcome back!"}
        </h2>
      </div>

      {/* Email/Password Form */}
      <form 
        onSubmit={handleEmailAuth} 
        className={`space-y-5 transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-50 transform translate-y-1' : 'opacity-100 transform translate-y-0'
        }`}
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            disabled={isLoading}
            className="h-12 bg-white border-gray-400 focus:border-gray-500 focus:ring-0 focus-visible:ring-1 focus-visible:ring-gray-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              disabled={isLoading}
              minLength={6}
              className="h-12 bg-white border-gray-400 focus:border-gray-500 focus:ring-0 focus-visible:ring-1 focus-visible:ring-gray-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link - only show for sign in */}
        {!isSignUp && (
          <div className="text-right">
            <Link
              href="/auth/reset-password"
              className="text-sm text-sage-700 hover:text-sage-800 font-medium"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {/* Terms Acceptance Checkbox - only show for sign up */}
        {isSignUp && (
          <div className="flex items-start space-x-3">
            <input
              id="acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 border-gray-400 rounded focus:ring-sage-500 focus:border-sage-500"
              disabled={isLoading}
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed">
              I agree to the{" "}
              <Link
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-700 hover:text-sage-800 underline font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-700 hover:text-sage-800 underline font-medium"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
        )}

        <Button 
          type="submit"
          className="w-full h-12 bg-sage-600 hover:bg-sage-700 text-white font-medium" 
          disabled={isLoading || (isSignUp && !acceptTerms)}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>

      {/* Divider */}
      <div 
        className={`relative transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-50 transform translate-y-1' : 'opacity-100 transform translate-y-0'
        }`}
      >
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>

      {/* Google Sign In */}
      <Button 
        onClick={handleGoogleSignIn} 
        variant="outline"
        className={`w-full h-12 border-gray-200 hover:bg-gray-50 font-medium transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-50 transform translate-y-1' : 'opacity-100 transform translate-y-0'
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Google
      </Button>

      {/* Toggle between Sign In / Sign Up */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleToggleMode}
          className="text-sm text-gray-600 hover:text-gray-900"
          disabled={isLoading}
        >
          {isSignUp 
            ? <>Already have an account? <span className="font-bold underline">Sign in</span></> 
            : <>Don't have an account? <span className="font-bold underline">Sign up</span></>
          }
        </button>
      </div>
    </div>
  )
}
