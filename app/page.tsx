"use client"

import { Button } from "@/components/ui/button"
import { MetalButtonWrapper, MetalCircleButton } from "@/components/ui/metal-button-wrapper"
import Link from "next/link"
import { ArrowUpRight, Leaf } from "lucide-react"
import { useEffect, useState, useRef } from "react"

// landing page
export default function LandingPage() {
  const [isAtTop, setIsAtTop] = useState(true)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const [hasScrolledPastThreshold, setHasScrolledPastThreshold] = useState(false)
  const [isPartiallyHidden, setIsPartiallyHidden] = useState(false)
  
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDirection = currentScrollY > lastScrollY.current
      
      // Update scroll states
      setIsAtTop(currentScrollY <= 50)
      setHasScrolledPastThreshold(currentScrollY > 100)
      setIsScrollingDown(scrollDirection)
      
      // Navigation visibility logic
      if (currentScrollY <= 50) {
        // At the very top - show navigation in default state
        setIsPartiallyHidden(false)
      } else if (currentScrollY > 100) {
        // Past threshold
        if (scrollDirection && currentScrollY > lastScrollY.current + 5) {
          // Scrolling down - partially hide navigation
          setIsPartiallyHidden(true)
        } else if (!scrollDirection && lastScrollY.current > currentScrollY + 5) {
          // Scrolling up - show navigation
          setIsPartiallyHidden(false)
        }
      }
      
      lastScrollY.current = currentScrollY
    }

    // Throttled scroll handler for better performance
    const throttledHandleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking.current = false
        })
        ticking.current = true
      }
    }

    // Initial call to set correct state
    handleScroll()
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [])

  // Determine navigation classes based on state
  const getNavigationClasses = () => {
    let classes = "mx-auto max-w-6xl w-[90%] flex items-center justify-between px-6 py-4 transition-all duration-300 ease-in-out "
    
    if (isAtTop) {
      // At top - transparent background, no rounded corners
      classes += "bg-transparent shadow-none rounded-none"
    } else {
      // Past top - white pill shape with very rounded corners
      classes += "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-full"
    }
    
    return classes
  }

  const getHeaderClasses = () => {
    let classes = "fixed top-0 left-0 right-0 z-50 px-6 pt-4 transition-transform duration-300 ease-in-out "
    
    if (isPartiallyHidden && hasScrolledPastThreshold && !isAtTop) {
      // Partially hidden - show only 15% of the navigation
      classes += "transform -translate-y-[85%]"
    } else {
      // Fully visible
      classes += "transform translate-y-0"
    }
    
    return classes
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Aurora Background - Noticeably Darker & More Ethereal */}
      <div className="fixed inset-0 bg-[#D5DDD6]">
        {/* Aurora Light Source 1 - Top Left */}
        <div 
          className="absolute -top-[20%] -left-[20%] w-[60vw] h-[60vw] rounded-full -z-10"
          style={{
            background: 'radial-gradient(circle, rgba(168, 207, 179, 0.7) 0%, rgba(198, 212, 180, 0.5) 40%, transparent 70%)',
            filter: 'blur(180px)'
          }}
        ></div>
        
        {/* Aurora Light Source 2 - Bottom Right */}
        <div 
          className="absolute -bottom-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full -z-10"
          style={{
            background: 'radial-gradient(circle, rgba(147, 173, 152, 0.6) 0%, transparent 70%)',
            filter: 'blur(200px)'
          }}
        ></div>
        
        {/* Aurora Light Source 3 - Center Right */}
        <div 
          className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full -z-10"
          style={{
            background: 'radial-gradient(circle, rgba(180, 200, 170, 0.5) 0%, rgba(160, 190, 165, 0.3) 50%, transparent 70%)',
            filter: 'blur(160px)'
          }}
        ></div>
      </div>
      
      {/* Header - Smart Navigation */}
      <header className={getHeaderClasses()}>
        <div className={getNavigationClasses()}>
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-sage-600 rounded-full flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" />
            </div>
            <span className="text-xl font-semibold font-diatype text-gray-900">
              matcharestock
            </span>
          </div>
          
          {/* Center Navigation */}
          <nav className="flex items-center space-x-8">
            <Link 
              href="#how-it-works" 
              className="font-diatype transition-colors duration-300 text-gray-700 hover:text-gray-900"
            >
              How it works
            </Link>
            <Link 
              href="#pricing" 
              className="font-diatype transition-colors duration-300 text-gray-700 hover:text-gray-900"
            >
              Pricing
            </Link>
          </nav>
          
          {/* Right Side - Auth Buttons */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/login" 
              className="font-diatype transition-colors duration-300 text-gray-700 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link href="/login?mode=signup">
              <MetalButtonWrapper
                title="Sign up"
                isSubscribed={false}
                icon={<ArrowUpRight className="w-4 h-4" />}
              />
            </Link>
          </div>
        </div>
      </header>
      
      {/* Spacer to prevent content jump when header becomes fixed */}
      <div className="h-24"></div>
      
      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="max-w-6xl w-[90%] mx-auto text-center">
          {/* Combined Frosted Glass Content Container */}
          <div 
            className="p-12 lg:p-16 transition-all duration-300 hover:shadow-[inset_0_0_3px_2px_rgba(255,255,255,0.25),0_0_50px_rgba(200,220,200,0.15),0_0_100px_rgba(180,200,180,0.08)] relative"
            style={{
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              boxShadow: `
                inset 0 0 2px 1.5px rgba(255, 255, 255, 0.2),
                0 0 40px rgba(200, 220, 200, 0.1),
                0 0 80px rgba(180, 200, 180, 0.05)
              `
            }}
          >
            <div className="relative z-10">
              {/* Hero Section */}
              <div className="mb-24">
                <h1 className="text-4xl lg:text-6xl font-bold text-black mb-6 font-gaisyr leading-tight">
                  Never miss a restock again.
                </h1>
                <p className="text-xl lg:text-2xl text-black font-diatype leading-relaxed">
                  Real-time notifications for your favorite premium matcha blends.
                </p>
              </div>

              {/* How It Works Section */}
              <div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <MetalCircleButton number="1" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2 font-diatype">Subscribe</h3>
                    <p className="text-black font-diatype">Choose your favorite matcha brands and get instant notifications.</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <MetalCircleButton number="2" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2 font-diatype">Monitor</h3>
                    <p className="text-black font-diatype">We continuously track inventory across premium matcha retailers.</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <MetalCircleButton number="3" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2 font-diatype">Get Notified</h3>
                    <p className="text-black font-diatype">Receive instant email alerts when your matcha comes back in stock.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preserved Vertical Space for Future Content */}
      <div className="py-24"></div>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl w-[90%] mx-auto text-center">
          <div 
            className="p-12 transition-all duration-300 hover:shadow-[inset_0_0_3px_2px_rgba(255,255,255,0.25),0_0_50px_rgba(200,220,200,0.15),0_0_100px_rgba(180,200,180,0.08)] relative"
            style={{
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              boxShadow: `
                inset 0 0 2px 1.5px rgba(255, 255, 255, 0.2),
                0 0 40px rgba(200, 220, 200, 0.1),
                0 0 80px rgba(180, 200, 180, 0.05)
              `
            }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8 font-gaisyr">
                Simple Pricing
              </h2>
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-black font-gaisyr mb-2">
                    $3.50<span className="text-xl font-normal text-black font-diatype">/month</span>
                  </div>
                  <p className="text-black font-diatype">Everything you need to never miss a restock</p>
                </div>
                <ul className="space-y-4 text-left mb-8">
                  <li className="flex items-center text-black font-diatype">
                    <div className="w-2 h-2 bg-sage-600 rounded-full mr-3"></div>
                    Unlimited brand subscriptions
                  </li>
                  <li className="flex items-center text-black font-diatype">
                    <div className="w-2 h-2 bg-sage-600 rounded-full mr-3"></div>
                    Real-time email notifications
                  </li>
                  <li className="flex items-center text-black font-diatype">
                    <div className="w-2 h-2 bg-sage-600 rounded-full mr-3"></div>
                    Cancel anytime
                  </li>
                </ul>
                <Link href="/login?mode=signup">
                  <MetalButtonWrapper
                    title="Get Started"
                    isSubscribed={false}
                    className="w-full"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6">
        <div className="max-w-6xl w-[90%] mx-auto text-center">
          <div 
            className="p-8 transition-all duration-300 relative"
            style={{
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              boxShadow: `
                inset 0 0 2px 1.5px rgba(255, 255, 255, 0.2),
                0 0 40px rgba(200, 220, 200, 0.1),
                0 0 80px rgba(180, 200, 180, 0.05)
              `
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-sage-600 rounded-full flex items-center justify-center">
                  <Leaf className="w-3 h-3 text-white" />
                </div>
                <span className="text-xl font-semibold text-black font-diatype">matcharestock</span>
              </div>
              <p className="text-black font-diatype mb-4">
                Your premium matcha monitor. Never miss a restock again.
              </p>
              <p className="text-sm text-black font-diatype">
                © 2024 MatchaRestock. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
