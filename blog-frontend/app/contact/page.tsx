"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { API_URL } from "@/lib/utils"
// First, add Telegram to the imports
import { Github, Linkedin, Twitter, Mail, MapPin, MessageSquare, Coffee, Phone } from "lucide-react"
// Add this import
import { BsTelegram } from "react-icons/bs"

export default function ContactPage() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ username: string; email: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("jwt")
    if (!token) {
      router.push("/auth/login")
      return
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (response.ok) {
          setUser(data.data.user)
        }
      } catch (err) {
        setError("Failed to load user data")
      }
    }

    fetchUser()
  }, [router])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setError("Message is required")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("jwt")
      const response = await fetch(`${API_URL}/contact/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      setSuccess("Message sent successfully! I'll get back to you soon.")
      setMessage("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary mb-2 font-sans">
              Contact Me
            </h1>
          </div>

          <div className="text-center">
            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-4 font-sans">
              Let's Create Something Amazing
            </h2>
            <p className="text-xl text-muted-foreground font-sans">
              Whether you have a project in mind or just want to chat, I'm always excited to connect and explore new opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8 font-sans">
              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-8 h-8 text-primary" />
                  Let's Connect
                </h2>
                <div className="prose prose-lg dark:prose-invert">
                  <p className="text-muted-foreground">
                    Ready to discuss your next project, share ideas, or explore collaboration opportunities? 
                    I'm here to help turn your vision into reality.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-lg">
                  <Mail className="w-6 h-6 text-primary" />
                  <span className="hover:text-primary transition-colors">
                    mamaruyirga1394@gmail.com
                  </span>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <Phone className="w-6 h-6 text-primary" />
                  <span className="hover:text-primary transition-colors">
                    +251921005559
                  </span>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                  <span>Addis Ababa, Ethiopia</span>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <a 
                      href="https://github.com/mamee13" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300 transform hover:scale-110"
                    >
                      <Github className="w-6 h-6" />
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/mamaru-yirga-b430a335a/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300 transform hover:scale-110"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                    <a 
                      href="https://x.com/mamee1313" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300 transform hover:scale-110"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                    <a 
                      href="https://t.me/fcujj" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300 transform hover:scale-110"
                    >
                      <BsTelegram size={24} />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coffee className="w-5 h-5" />
                  <span>Always open for interesting conversations</span>
                </div>
              </div>
            </div>

            <div className="relative font-sans">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl -rotate-6 transform"></div>
              <Card className="relative">
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                  <CardDescription>
                    {user ? `Sending as ${user.username} (${user.email})` : 'Loading...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {success && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your ideas, projects, or just say hello!"
                        rows={6}
                        className="resize-none"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
