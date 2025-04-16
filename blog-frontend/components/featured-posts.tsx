"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"

interface Post {
  _id: string
  title: string
  summary: string
  author: {
    name: string
  }
  createdAt: string
  slug: string
}

export default function FeaturedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/posts/featured');
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setPosts([
            {
              _id: "1",
              title: "Getting Started with React Hooks",
              summary: "Learn how to use React Hooks to simplify your components and manage state effectively.",
              author: { name: "Jane Doe" },
              createdAt: "2023-04-15T10:30:00Z",
              slug: "getting-started-with-react-hooks",
            },
            {
              _id: "2",
              title: "Building RESTful APIs with Node.js",
              summary: "A comprehensive guide to building scalable and maintainable APIs using Node.js and Express.",
              author: { name: "John Smith" },
              createdAt: "2023-04-10T14:20:00Z",
              slug: "building-restful-apis-with-nodejs",
            },
            {
              _id: "3",
              title: "CSS Grid vs Flexbox: When to Use Each",
              summary:
                "Understanding the differences between CSS Grid and Flexbox and knowing when to use each layout method.",
              author: { name: "Alex Johnson" },
              createdAt: "2023-04-05T09:15:00Z",
              slug: "css-grid-vs-flexbox",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching featured posts:", error)
        setLoading(false)
      }
    }

    fetchFeaturedPosts()
  }, [])

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/2" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link href={`/posts/${post.slug}`} key={post._id}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.summary}</p>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <span>By {post.author.name}</span>
                <span>{formatDate(post.createdAt)}</span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
