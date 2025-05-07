"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatDate, API_URL } from "@/lib/utils"

const stripHtmlTags = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

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
        const response = await fetch(`${API_URL}/posts?featured=true&limit=3`)
        const data = await response.json()
        setPosts(Array.isArray(data) ? data.slice(0, 3) : [])
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post._id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">
                <Link href={`/posts/${post._id}`} className="hover:text-primary">
                  {stripHtmlTags(post.title)}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-muted-foreground mb-4 flex-grow">
                {stripHtmlTags(post.content).substring(0, 120)}...
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
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
