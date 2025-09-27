"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "@/app/(auth)/login/actions"

interface User {
  email?: string
  id: string
  name?: string
}

type ClarityXNavigationProps = {
  user: User | null
}

export default function ClarityXNavigation({ user }: ClarityXNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  // Only show navigation links on the home page
  const isHomePage = pathname === "/" || pathname === "/home"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-xl shadow-sm" : "bg-white/90 backdrop-blur-xl"
      } border-b border-gray-200`}
    >
      <div className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="text-xl font-bold text-black hover:opacity-80 transition-opacity duration-300 cursor-pointer"
            >
              Clarity
              <span
                className="text-white font-bold mx-1"
                style={{ WebkitTextStroke: "1px black" }}
              >
                X
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {isHomePage && (
              <>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-sm text-gray-600 hover:text-black transition-colors duration-200 font-medium cursor-pointer relative group"
                >
                  Features
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform transition-transform duration-200 scale-x-0 group-hover:scale-x-100"></span>
                </button>
                <button
                  onClick={() => scrollToSection("demo")}
                  className="text-sm text-gray-600 hover:text-black transition-colors duration-200 font-medium cursor-pointer relative group"
                >
                  Demo
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform transition-transform duration-200 scale-x-0 group-hover:scale-x-100"></span>
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-sm text-gray-600 hover:text-black transition-colors duration-200 font-medium cursor-pointer relative group"
                >
                  Contact
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform transition-transform duration-200 scale-x-0 group-hover:scale-x-100"></span>
                </button>
              </>
            )}
          </div>

          {/* Desktop CTA or Account Icon */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="rounded-full p-1.5 transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus-visible:ring-0 data-[state=open]:bg-gray-100 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 pointer-events-none">
                      <AvatarImage src="/assets/Icons/accountIcon.png" alt="Account" />
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2 focus:bg-gray-100 focus:text-foreground data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground cursor-pointer">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium leading-none">{user.email ? user.email : "Guest Account"}</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-100 focus:text-foreground data-[highlighted]:bg-gray-100 data-[highlighted]:text-foreground cursor-pointer">
                    <form action="/home" method="POST" className="w-full">
                      <button className="w-full text-left" formAction={signOut}>
                        Sign Out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-black hover:bg-gray-100 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 cursor-pointer"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-4 shadow-lg">
          <div className="flex flex-col space-y-4">
            {isHomePage && (
              <>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-600 hover:text-black transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 text-left cursor-pointer"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("demo")}
                  className="text-gray-600 hover:text-black transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 text-left cursor-pointer"
                >
                  Demo
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-gray-600 hover:text-black transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 text-left cursor-pointer"
                >
                  Contact
                </button>
              </>
            )}
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-2">
                    <div className="flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/assets/Icons/accountIcon.png" alt="Account" />
                      </Avatar>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.email ? user.email : "Guest Account"}</p>
                    </div>
                  </div>
                  <form action="/home" method="POST">
                    <button
                      className="w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      formAction={signOut}
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:text-black hover:bg-gray-100 rounded-full font-medium justify-start cursor-pointer transition-all duration-200 w-full"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800 rounded-full font-medium cursor-pointer transition-all duration-200 w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}