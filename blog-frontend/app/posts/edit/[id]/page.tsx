"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/lib/utils"
// Update this line
import { Editor } from "@/components/editor"

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('jwt')
        if (!token) {
          router.push('/auth/login')
          return
        }

        const response = await fetch(`${API_URL}/posts/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) throw new Error("Failed to fetch post")

        const data = await response.json()
        // Handle both data structures (data.data or direct post data)
        const post = data.data || data
        setTitle(post.title)
        setContent(post.content || '') // Add fallback empty string
        setLoading(false)
      } catch (err) {
        setError("Failed to load post")
        setLoading(false)
      }
    }

    fetchPost()
  }, [resolvedParams.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('jwt')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${API_URL}/posts/${resolvedParams.id}`, {
        method: 'PATCH', // Change from 'PUT' to 'PATCH'
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      })

      if (!response.ok) throw new Error("Failed to update post")

      router.push(`/posts/${resolvedParams.id}`)
    } catch (err) {
      setError("Failed to update post")
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Content</label>
          <Editor value={content} onChange={setContent} />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Update Post</Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push(`/posts/${resolvedParams.id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}