"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, API_URL } from "@/lib/utils"
import { Edit, Trash2, ArrowLeft } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Post {
  _id: string
  title: string
  content: string
  author: {
    _id: string
    username: string
  }
  createdAt: string
  updatedAt: string
  category: string
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthor, setIsAuthor] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('jwt')
        
        // Check if token exists and is properly formatted
        if (!token) {
          throw new Error("Please login to view this post")
        }

        const response = await fetch(`${API_URL}/posts/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${token.trim()}`, // Ensure token is properly formatted
            'Content-Type': 'application/json'
          }
        })
        
        if (response.status === 401 || response.status === 403) {
          throw new Error("Please login again to view this post")
        }
        
        if (!response.ok) throw new Error("Failed to load post")
        
        const data = await response.json()
        setPost(data.post || data)
        
        // Only check author status if we have a valid token
        try {
          const userResponse = await fetch(`${API_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token.trim()}`
            }
          })
          const userData = await userResponse.json()
          setIsAuthor(userData._id === (data.post || data).author._id)
        } catch (err) {
          console.error('Error checking author status:', err)
        }
        
        setLoading(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load post"
        setError(errorMessage)
        setLoading(false)
        
        // If token is invalid, redirect to login
        if (errorMessage.includes("login")) {
          router.push('/auth/login')
        }
      }
    }

    if (resolvedParams.id) {
      fetchPost()
    }
  }, [resolvedParams.id, router])

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/posts/${post?._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      router.push("/posts")
    } catch (err) {
      console.error("Error deleting post:", err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error || "Post not found"}</p>
        <Button asChild>
          <Link href="/posts">Back to Posts</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Link>
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post?.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
            <span>By {post?.author.username}</span>
            <span>•</span>
            <span>Published {formatDate(post?.createdAt || '')}</span>
            {post?.updatedAt !== post?.createdAt && (
              <>
                <span>•</span>
                <span>Updated {formatDate(post?.updatedAt || '')}</span>
              </>
            )}
          </div>

          {isAuthor && (
            <div className="flex gap-2 mb-6">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/posts/edit/${post?._id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your post.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post?.content || '' }}
        />
      </div>
    </div>
  )
}