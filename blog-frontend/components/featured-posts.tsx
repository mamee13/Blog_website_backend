"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatDate, API_URL } from "@/lib/utils"
import DOMPurify from 'isomorphic-dompurify'

// Add this utility function at the top of the file
function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

interface Post {
  _id: string
  title: string
  content: string
  author: {
    _id: string
    username: string
  }
  createdAt: string
  category: string
}

export default function FeaturedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts?featured=true&limit=3`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        })
        const data = await response.json()
        setPosts(data.posts || data)
      } catch (error) {
        console.error('Error fetching featured posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPosts()
  }, [])

  if (loading) {
    return <div>Loading featured posts...</div>
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">
                <Link href={`/posts/${post._id}`} className="hover:text-primary">
                  <div dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(post.title) 
                  }} />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {stripHtml(post.content).substring(0, 120)}...
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>By {post.author?.username || 'Unknown Author'}</span>
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
          </Card>
        ))}
      </div>
    </section>
  )
}
