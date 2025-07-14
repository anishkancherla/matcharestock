"use client"

import { Button } from "@/components/ui/button"
import { MetalButtonWrapper, MetalCircleButton } from "@/components/ui/metal-button-wrapper"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { Settings } from "lucide-react"
import Image from "next/image"

// landing page
export default function LandingPage() {
  const [isAtTop, setIsAtTop] = useState(true)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const [hasScrolledPastThreshold, setHasScrolledPastThreshold] = useState(false)
  const [isPartiallyHidden, setIsPartiallyHidden] = useState(false)
  
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

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

    // Click outside handler for mobile dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false)
      }
    }

    // Initial call to set correct state
    handleScroll()
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
      {/* Hero Section with White Background */}
      <div className="bg-white relative">
        {/* Dynamic Aurora Background - Only for Hero Section */}
        <div className="absolute inset-0 bg-[#D5DDD6]">
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
            {/* Mobile Layout */}
            <div className="md:hidden w-full">
              {!isAtTop ? (
                // Scrolled down - show only nav items without logo
                <div className="flex items-center justify-center w-full space-x-6">
                  <Link 
                    href="#pricing" 
                    className="font-diatype transition-colors duration-300 text-gray-700 hover:text-gray-900 text-sm"
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="#questions" 
                    className="font-diatype transition-colors duration-300 text-gray-700 hover:text-gray-900 text-sm"
                  >
                    Info
                  </Link>
                  <Link 
                    href="/login" 
                    className="font-diatype transition-colors duration-300 text-gray-700 hover:text-gray-900 text-sm"
                  >
                    Log in
                  </Link>
                </div>
              ) : (
                // At top - show logo with sign up button below and dropdown menu
                <div className="flex flex-col space-y-4 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-semibold font-diatype-mono text-gray-900">
                          matcharestock
                        </span>
                      </Link>
                      <div className="mt-2 space-y-4">
                        <Link href="/login?mode=signup">
                          <MetalButtonWrapper
                            title="Sign up"
                            isSubscribed={false}
                            icon={<ArrowUpRight className="w-4 h-4" />}
                          />
                        </Link>
                                                 {/* Discord Button - Mobile */}
                         <Link 
                           href="https://discord.gg/g3Spmt7P" 
                           target="_blank" 
                           rel="noopener noreferrer"
                         >
                           <button className="discord-metal-button">
                             <div className="flex items-center space-x-2 relative z-10">
                               <span className="text-sm font-medium">Join the Discord</span>
                               <ArrowUpRight className="w-4 h-4" />
                             </div>
                           </button>
                         </Link>
                      </div>
                    </div>
                    <div className="relative" ref={settingsRef}>
                      <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className="p-2 backdrop-blur-xl bg-white/20 border border-white/30 text-gray-900 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      
                      {settingsOpen && (
                        <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-white/90 border border-white/40 rounded-lg shadow-lg z-50">
                          <div className="py-2">
                            <Link 
                              href="#pricing" 
                              className="block px-4 py-2 text-gray-700 hover:bg-white/50 font-diatype transition-colors"
                              onClick={() => setSettingsOpen(false)}
                            >
                              Pricing
                            </Link>
                            <Link 
                              href="#questions" 
                              className="block px-4 py-2 text-gray-700 hover:bg-white/50 font-diatype transition-colors"
                              onClick={() => setSettingsOpen(false)}
                            >
                              Info
                            </Link>
                            <Link 
                              href="/login" 
                              className="block px-4 py-2 text-gray-700 hover:bg-white/50 font-diatype transition-colors"
                              onClick={() => setSettingsOpen(false)}
                            >
                              Log in
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between w-full">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <span className="text-xl font-semibold font-diatype-mono text-gray-900">
                  matcharestock
                </span>
              </div>
              
              {/* Center Navigation */}
              <nav className="flex items-center space-x-8">
                <Link 
                  href="#pricing" 
                  className="font-diatype transition-colors duration-300 text-gray-700 hover:text-gray-900"
                >
                  Pricing
                </Link>
                <Link 
                  href="#questions" 
                  className="font-diatype transition-colors duration-300 text-gray-700 hover:text-gray-900"
                >
                  Info
                </Link>
              </nav>
              
              {/* Right Side - Auth Buttons */}
              <div className="flex flex-col items-end space-y-3">
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
                                 {/* Discord Button - Desktop */}
                 <Link 
                   href="https://discord.gg/g3Spmt7P" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full"
                 >
                   <button className="discord-metal-button">
                     <div className="flex items-center space-x-2 relative z-10">
                       <span className="text-sm font-medium">Join the Discord</span>
                       <ArrowUpRight className="w-4 h-4" />
                     </div>
                   </button>
                 </Link>
              </div>
            </div>
          </div>
        </header>
        
        {/* Spacer to prevent content jump when header becomes fixed */}
        <div className="h-36 md:h-36"></div>
        
        {/* Main Hero Content */}
        <main className="relative z-10 flex items-center justify-center px-6 pb-16 mt-8 md:mt-0">
          <div className="max-w-6xl w-[90%] mx-auto text-center">
            {/* Combined Frosted Glass Content Container */}
            <div 
              className="p-12 lg:p-16 transition-all duration-300 hover:shadow-[inset_0_0_3px_2px_rgba(255,255,255,0.25),0_0_50px_rgba(200,220,200,0.15),0_0_100px_rgba(180,200,180,0.08)] relative border border-white/30"
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
                <div className="mb-16">
                  <h1 className="text-2xl md:text-4xl lg:text-4xl font-bold text-black mb-6 font-gaisyr leading-tight">
                    Real-time <span style={{ color: '#e67e22' }}>email</span> and <span style={{ color: 'rgb(114, 137, 217)' }}>discord</span> notifications for your favorite matcha brands.
                  </h1>
                  <p className="hidden md:block text-lg md:text-xl lg:text-2xl text-gray-600 font-diatype leading-relaxed">
                    Never miss a restock again!
                  </p>
                </div>

                {/* How It Works Section */}
                <div className="mb-0">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      {/* Dashboard Display Image - Match total height of section 3 images */}
                      <div className="mb-4 flex justify-center" style={{ height: '400px' }}>
                        <img 
                          src="/images/dashboarddisplay.png" 
                          alt="Dashboard display showing brand subscriptions" 
                          className="max-w-full h-auto md:ml-0 -ml-6"
                          style={{ maxHeight: '240px', marginTop: 'auto', marginBottom: 'auto' }}
                        />
                      </div>
                      <div className="flex justify-center mb-4">
                        <MetalCircleButton number="1" />
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2 font-diatype">Subscribe</h3>
                      <p className="text-gray-500 font-diatype-thin">Choose your desired brands and sign up for notifications.</p>
                    </div>
                    
                    <div className="text-center">
                      {/* Mobile Layout - Images first, then text below */}
                      <div className="md:hidden space-y-4">
                        {/* Images positioned above text on mobile */}
                        <div className="relative flex justify-center h-40 mb-4">
                          {/* Sayaka image - bottom layer, adjusted left */}
                          <img 
                            src="/images/sayaka.png" 
                            alt="Sayaka matcha product" 
                            className="absolute z-10"
                            style={{ 
                              maxHeight: '160px',
                              top: '10px',
                              left: '50%',
                              transform: 'translateX(-40%)'
                            }}
                          />
                          {/* Wako image - top layer, adjusted left */}
                          <img 
                            src="/images/wako.png" 
                            alt="Wako matcha product" 
                            className="absolute z-30"
                            style={{ 
                              maxHeight: '140px',
                              top: '50px',
                              left: '50%',
                              transform: 'translateX(-60%)'
                            }}
                          />
                        </div>
                        
                        <div className="flex justify-center">
                          <MetalCircleButton number="2" />
                        </div>
                        <h3 className="text-lg font-semibold text-black font-diatype">Monitor</h3>
                        <p className="text-gray-500 font-diatype-thin">We continuously track stock status across your favorite matcha retailers.</p>
                      </div>

                      {/* Desktop Layout - Original order */}
                      <div className="hidden md:block">
                        {/* Layered Images - Match total height of section 3 images */}
                        <div className="relative mb-4 flex justify-center" style={{ height: '400px' }}>
                          {/* Sayaka image - now bottom layer */}
                          <img 
                            src="/images/sayaka.png" 
                            alt="Sayaka matcha product" 
                            className="absolute z-10"
                            style={{ 
                              maxHeight: '180px',
                              top: '60px',
                              left: '50%',
                              transform: 'translateX(-30%)'
                            }}
                          />
                          {/* Wako image - now top layer */}
                          <img 
                            src="/images/wako.png" 
                            alt="Wako matcha product" 
                            className="absolute z-30"
                            style={{ 
                              maxHeight: '160px',
                              top: '100px',
                              left: '50%',
                              transform: 'translateX(-50%)'
                            }}
                          />
                        </div>
                        <div className="flex justify-center mb-4">
                          <MetalCircleButton number="2" />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2 font-diatype">Monitor</h3>
                        <p className="text-gray-500 font-diatype-thin">We continuously track inventory across your favorite matcha retailers. Our system monitors stock levels 24/7 and detects changes instantly.</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      {/* Mobile Layout - RestockBot above, Mockup below */}
                      <div className="md:hidden space-y-4">
                        <div className="flex justify-center mb-4">
                          <MetalCircleButton number="3" />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2 font-diatype">Get Notified</h3>
                        <p className="text-gray-500 font-diatype-thin">Receive instant email and discord alerts when your matcha comes back in stock.</p>
                        
                        {/* RestockBot Image - Above mockup on mobile */}
                        <div className="mb-4 flex justify-center h-32">
                          <img 
                            src="/images/restockbot.PNG" 
                            alt="RestockBot Discord notification" 
                            className="max-w-full h-auto"
                            style={{ maxHeight: '120px' }}
                          />
                        </div>
                        
                        {/* Figma Mockup Image */}
                        <div className="mb-4 flex justify-center h-40">
                          <img 
                            src="/images/mockup.png" 
                            alt="Matcha restock notification mockup" 
                            className="max-w-full h-auto"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      </div>

                      {/* Desktop Layout - RestockBot above, Mockup below */}
                      <div className="hidden md:block">
                        {/* Combined image container - Match height of other sections */}
                        <div className="mb-4 flex flex-col justify-center" style={{ height: '400px' }}>
                          {/* RestockBot Image - Above mockup, bigger on desktop */}
                          <div className="flex justify-center mb-4">
                            <img 
                              src="/images/restockbot.PNG" 
                              alt="RestockBot Discord notification" 
                              className="max-w-full h-auto"
                              style={{ maxHeight: '240px' }}
                            />
                          </div>
                          
                          {/* Figma Mockup Image - Below RestockBot */}
                          <div className="flex justify-center">
                            <img 
                              src="/images/mockup.png" 
                              alt="Matcha restock notification mockup" 
                              className="max-w-full h-auto"
                              style={{ maxHeight: '160px' }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-center mb-4">
                          <MetalCircleButton number="3" />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2 font-diatype">Get Notified</h3>
                        <p className="text-gray-500 font-diatype-thin">Receive instant email and discord alerts when your matcha comes back in stock.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* White background section continues here - full page width */}
      <div className="bg-white">
        <div className="max-w-6xl w-[90%] mx-auto">
          {/* Brands We Currently Track Section */}
          <div className="pt-16">
            <div className="space-y-16">
              {/* Ippodo Tea Co. */}
              <div className="relative">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-6 font-diatype">
                    Ippodo Tea
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 mb-6">
                    <span className="text-[#757575] font-diatype-thin">Ummon</span>
                    <span className="text-[#757575] font-diatype-thin">Sayaka</span>
                    <span className="text-[#757575] font-diatype-thin">Kan</span>
                    <span className="text-[#757575] font-diatype-thin">Ikuyo</span>
                    <span className="text-[#757575] font-diatype-thin">Wakaki</span>
                  </div>
                  <div className="bg-gradient-to-r from-[#e67e22]/10 to-[#e67e22]/5 border-l-4 border-[#e67e22] p-4 rounded-r-lg">
                    <p className="text-[#e67e22] font-medium font-diatype leading-relaxed">
                      Ippodo frequently opens pre-orders for most of their blends - we track exactly when their pre-orders go live so you never miss out!
                    </p>
                  </div>
                </div>
                
                {/* Creative separator */}
                <div className="flex items-center justify-center mt-12">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <div className="mx-4 w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
              </div>

              {/* Marukyu Koyamaen */}
              <div className="relative">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-6 font-diatype">
                    Marukyu Koyamaen
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
                    <span className="text-[#757575] font-diatype-thin">Kiwami Choan</span>
                    <span className="text-[#757575] font-diatype-thin">Unkaku</span>
                    <span className="text-[#757575] font-diatype-thin">Wako</span>
                    <span className="text-[#757575] font-diatype-thin">Tenju</span>
                    <span className="text-[#757575] font-diatype-thin">Choan</span>
                    <span className="text-[#757575] font-diatype-thin">Eiju</span>
                    <span className="text-[#757575] font-diatype-thin">Kinrin</span>
                    <span className="text-[#757575] font-diatype-thin">Yugen</span>
                    <span className="text-[#757575] font-diatype-thin">Chigi no Shiro</span>
                    <span className="text-[#757575] font-diatype-thin">Isuzu</span>
                    <span className="text-[#757575] font-diatype-thin">Aoarashi</span>
                  </div>
                </div>
                
                {/* Creative separator */}
                <div className="flex items-center justify-center mt-12">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <div className="mx-4 w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
              </div>

              {/* Yamamasa Koyamaen - Coming Soon */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#2d2d2d] mb-2 font-diatype">
                  Yamamasa Koyamaen
                </h3>
                <span className="bg-gradient-to-r from-[#e67e22] to-[#d35400] text-white text-xs font-medium px-3 py-1 rounded-full font-diatype shadow-sm">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preserved Vertical Space for Future Content */}
        <div className="py-12"></div>

        {/* Request New Brand Section */}
        <section className="relative z-10 py-8 px-6">
          <div className="max-w-6xl w-[90%] mx-auto">
            <div className="flex items-start space-x-4 justify-center">
              <span className="text-3xl text-[#e67e22] font-bold mt-1">*</span>
              <p className="text-lg text-gray-700 font-diatype leading-relaxed max-w-4xl">
                Looking for a brand/blend we don't track yet? We're constantly planning to add new alerts —just{' '}
                <a 
                  href="mailto:matcharestock@gmail.com" 
                  className="text-[#e67e22] hover:text-[#d35400] transition-colors duration-300 font-medium underline decoration-2 underline-offset-2"
                >
                  email us
                </a>
                {' '}and we'll add it to our watch list!
              </p>
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="bg-gray-300 h-[2px] w-full max-w-6xl mx-auto my-10"></div>

        {/* Pricing Section */}
        <section id="pricing" className="relative z-10 py-24 px-6">
          <div className="max-w-2xl w-[90%] mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8 font-diatype">
              Pricing
            </h2>
            <div 
              className="p-12 transition-all duration-300 relative border border-gray-300"
              style={{
                borderRadius: '24px',
              }}
            >
              <div className="relative z-10">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <div className="text-5xl font-bold text-black font-diatype-mono mb-2">
                      $1.99<span className="text-xl font-normal text-black font-diatype">/month</span>
                    </div>
                    <p className="text-black font-diatype-thin">Everything you need to never miss a restock</p>
                  </div>
                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-center text-black font-diatype-thin">
                      <div className="w-2 h-2 bg-sage-600 rounded-full mr-3"></div>
                      Unlimited brand subscriptions
                    </li>
                    <li className="flex items-center text-black font-diatype-thin">
                      <div className="w-2 h-2 bg-sage-600 rounded-full mr-3"></div>
                      Real-time email and discord notifications
                    </li>
                    <li className="flex items-center text-black font-diatype-thin">
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

        {/* Questions Section */}
        <section id="questions" className="bg-white py-12 px-6">
          <div className="max-w-4xl w-[90%] mx-auto text-center">
            <p className="text-lg text-gray-700 font-diatype">
              Questions? Email us at{' '}
              <a 
                href="mailto:matcharestock@gmail.com" 
                className="text-[#e67e22] hover:text-[#d35400] transition-colors duration-300 underline decoration-1 underline-offset-2"
              >
                matcharestock@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-black py-24 px-6">
          <div className="max-w-4xl w-[90%] mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-12 text-center font-diatype">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 font-diatype">
                  1. Which brands and blends do you track right now?
                </h3>
                <p className="text-gray-300 font-diatype-thin leading-relaxed">
                  Ippodo and Marukyu Koyamaen. The full matcha line-ups are listed on our home page. You can ask us to add others! (see Q4).
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 font-diatype">
                  2. How fast are the alerts?
                </h3>
                <p className="text-gray-300 font-diatype-thin leading-relaxed">
                  Emails land within 1 minute of the restock!
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 font-diatype">
                  3. Can I request a new brand or blend?
                </h3>
                <p className="text-gray-300 font-diatype-thin leading-relaxed">
                  Absolutely, please email us the product name and URL! Most popular requests will be prioritized.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 font-diatype">
                  4. Do I need to keep my browser open or run an app?
                </h3>
                <p className="text-gray-300 font-diatype-thin leading-relaxed">
                  Nope! All monitoring happens on our servers; you just watch your inbox. (We recommend you turn your email alerts on!)
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 font-diatype">
                  5. How safe is my data?
                </h3>
                <p className="text-gray-300 font-diatype-thin leading-relaxed">
                  All payments are handled by Stripe; we never see your card number. Your email is used only for restock alerts and account messages.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 font-diatype">
                  6. Why didn't I get my restock alert?
                </h3>
                <p className="text-gray-300 font-diatype-thin leading-relaxed">
                  Please check that our emails aren't in your spam folder and that the item is still part of your subscriptions. If the problem persists, please email support so we can investigate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="bg-gray-300 h-px w-full"></div>

        {/* Footer */}
        <footer id="contact" className="relative z-10 py-12 px-6 bg-black">
          <div className="max-w-6xl w-[90%] mx-auto text-center">
            <div className="p-8 transition-all duration-300 relative">
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="text-xl font-semibold text-white font-diatype-mono">matcharestock</span>
                </div>
                
                {/* Legal Links */}
                <div className="flex items-center justify-center space-x-6 mb-4">
                  <Link
                    href="/privacy-policy"
                    className="text-sm text-gray-300 hover:text-white font-diatype transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms-of-service"
                    className="text-sm text-gray-300 hover:text-white font-diatype transition-colors"
                  >
                    Terms of Service
                  </Link>
                </div>
                
                <p className="text-sm text-white font-diatype-thin">
                  © 2025 MatchaRestock. All rights reserved.
                </p>
                <p className="text-xs text-gray-400 font-diatype-thin mt-2 leading-relaxed">
                  MatchaRestock is an independent service—it is not affiliated, endorsed, or sponsored by Ippodo, Marukyu Koyamaen, or any other brand. All product names, logos, and trademarks remain the property of their respective owners.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
