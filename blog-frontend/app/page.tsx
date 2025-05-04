"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import FeaturedPosts from "@/components/featured-posts"
import RecentPosts from "@/components/recent-posts"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('jwt')
      setIsLoggedIn(!!token)
    }

    checkLogin()
    window.addEventListener('auth-login', checkLogin)
    window.addEventListener('auth-logout', checkLogin)

    return () => {
      window.removeEventListener('auth-login', checkLogin)
      window.removeEventListener('auth-logout', checkLogin)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Welcome to Our Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover stories, insights, and knowledge from writers on any topic.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/posts">Browse Posts</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={isLoggedIn ? "/posts/create" : "/auth/login"}>
                {isLoggedIn ? "Create Post" : "Start Writing"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Posts</h2>
          <Button variant="ghost" asChild>
            <Link href="/posts" className="flex items-center gap-2">
              View all <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      <FeaturedPosts />
      
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Recent Posts</h2>
          <Button variant="ghost" asChild>
            <Link href="/posts" className="flex items-center gap-2">
              View all <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
        <RecentPosts />
      </section>

      {/* CTA Section - Only show when not logged in */}
      {!isLoggedIn && (
        <section className="py-12 bg-muted rounded-lg my-12">
          <div className="text-center space-y-4 px-4 py-8">
            <h2 className="text-3xl font-bold">Ready to share your ideas?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our community of writers and readers today.
            </p>
            <div className="pt-4">
              <Button asChild size="lg">
                <Link href="/auth/register">Create an Account</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
