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

export default function RecentPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/posts?limit=6');
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setPosts([
            {
              _id: "4",
              title: "Introduction to TypeScript",
              summary: "Learn the basics of TypeScript and how it can improve your JavaScript development experience.",
              author: { name: "Sarah Williams" },
              createdAt: "2023-04-02T11:45:00Z",
              slug: "introduction-to-typescript",
            },
            {
              _id: "5",
              title: "Mastering Git Workflows",
              summary: "Improve your team collaboration with effective Git branching strategies and workflows.",
              author: { name: "Michael Brown" },
              createdAt: "2023-03-28T16:30:00Z",
              slug: "mastering-git-workflows",
            },
            {
              _id: "6",
              title: "Responsive Web Design Principles",
              summary: "Essential principles and techniques for creating websites that work well on any device.",
              author: { name: "Emily Davis" },
              createdAt: "2023-03-25T13:20:00Z",
              slug: "responsive-web-design-principles",
            },
            {
              _id: "7",
              title: "JavaScript Promises and Async/Await",
              summary: "A deep dive into asynchronous JavaScript with Promises and the async/await syntax.",
              author: { name: "David Wilson" },
              createdAt: "2023-03-20T09:10:00Z",
              slug: "javascript-promises-and-async-await",
            },
            {
              _id: "8",
              title: "Getting Started with Docker",
              summary:
                "Learn how to containerize your applications with Docker for consistent development and deployment.",
              author: { name: "Lisa Taylor" },
              createdAt: "2023-03-15T14:50:00Z",
              slug: "getting-started-with-docker",
            },
            {
              _id: "9",
              title: "Introduction to GraphQL",
              summary:
                "Discover how GraphQL can improve your API development and provide more efficient data fetching.",
              author: { name: "Robert Johnson" },
              createdAt: "2023-03-10T10:05:00Z",
              slug: "introduction-to-graphql",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching recent posts:", error)
        setLoading(false)
      }
    }

    fetchRecentPosts()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-1/2" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Link href={`/posts/${post.slug}`} key={post._id}>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3">{post.summary}</p>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <span>By {post.author.name}</span>
              <span>{formatDate(post.createdAt)}</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
