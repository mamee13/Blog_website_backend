"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { formatDate, API_URL } from "@/lib/utils"

interface Post {
  _id: string
  title: string
  content: string
  author: {
    _id: string
    username: string  // Changed from name to username
  }
  createdAt: string
  category: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        })
        const data = await response.json()
        setPosts(data.posts || data)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post._id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">
                <Link href={`/posts/${post._id}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {post.content.substring(0, 150)}...
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>By {post.author.username}</span>  {/* Changed from author.name to author.username */}
                <span>•</span>
                <span>{formatDate(post.createdAt)}</span>
                {post.category && (
                  <>
                    <span>•</span>
                    <span>{post.category}</span>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-auto">
              <Link 
                href={`/posts/${post._id}`}
                className="text-primary hover:underline"
              >
                Read more
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
