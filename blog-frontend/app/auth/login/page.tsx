"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_URL } from "@/lib/utils"
// Add Eye and EyeOff to imports
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      localStorage.setItem("jwt", data.token)
      window.dispatchEvent(new Event('auth-login'))
      router.push("/posts")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const useDemoAccount = () => {
    setEmail("mamaruyirga1394@gmail.com")
    setPassword("Password123")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in to continue your journey
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl -rotate-3 transform"></div>
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <LogIn className="w-6 h-6 text-primary" />
                  Login
                </CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                  <Button
                    type="button"
                    variant="link"
                    className="text-primary p-0 h-auto font-normal hover:text-primary/80"
                    onClick={useDemoAccount}
                  >
                    or Use demo account
                  </Button>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        Password
                      </Label>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-primary/20 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary hover:opacity-90 transition-opacity"
                    disabled={loading}
                  >
                    {loading ? (
                      "Logging in..."
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link 
                    href="/auth/register" 
                    className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 justify-center mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create an account
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
