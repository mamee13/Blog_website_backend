"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { Search } from "lucide-react"

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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/posts');
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          const mockPosts = [
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
          ]

          setPosts(mockPosts)
          setFilteredPosts(mockPosts)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching posts:", error)
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts(posts)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.summary.toLowerCase().includes(query) ||
          post.author.name.toLowerCase().includes(query),
      )
      setFilteredPosts(filtered)
    }
  }, [searchQuery, posts])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">All Posts</h1>

        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search posts..."
            className="pl-10 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : (
        <>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">No posts found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your search criteria</p>
              <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
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
          )}
        </>
      )}
    </div>
  )
}
