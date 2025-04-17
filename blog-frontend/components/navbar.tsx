"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Menu, X, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const router = useRouter()

  const checkLogin = () => {
    const token = localStorage.getItem("jwt")
    try {
      if (token) {
        setIsLoggedIn(true)
        setUser({ name: "User" })
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking login state:', error)
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  useEffect(() => {
    checkLogin() // Initial check

    // Add event listeners
    window.addEventListener("auth-login", checkLogin)
    window.addEventListener("auth-logout", checkLogin)
    window.addEventListener("storage", checkLogin)

    // Force check login status every second (temporary solution)
    const interval = setInterval(checkLogin, 1000)

    return () => {
      window.removeEventListener("auth-login", checkLogin)
      window.removeEventListener("auth-logout", checkLogin)
      window.removeEventListener("storage", checkLogin)
      clearInterval(interval)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("jwt")  // Changed from "token" to "jwt"
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUser(null)
    router.push("/")
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold">
            BlogSite
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/posts" className="text-sm font-medium hover:text-primary">
              Posts
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/posts/create">Create Post</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4 pb-4">
              <Link href="/" className="text-sm font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link
                href="/posts"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Posts
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="text-sm font-medium hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/posts/create"
                    className="text-sm font-medium hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Post
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start px-0 hover:bg-transparent"
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button asChild>
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

// Remove the duplicate Navbar const declaration at the bottom
