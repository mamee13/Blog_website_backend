"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
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
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthor, setIsAuthor] = useState(false)
  const router = useRouter()
  const { slug } = params

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/posts/${slug}`);
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          // Check if user is logged in
          const token = localStorage.getItem("jwt")
          const userId = token ? "user123" : null // In a real app, you'd decode the JWT

          const mockPost = {
            _id: "1",
            title: "Getting Started with React Hooks",
            content: `
              <h2>Introduction</h2>
              <p>React Hooks were introduced in React 16.8 as a way to use state and other React features without writing a class component. They allow you to "hook into" React state and lifecycle features from function components.</p>
              
              <h2>Why Hooks?</h2>
              <p>Hooks solve several problems in React:</p>
              <ul>
                <li>They let you reuse stateful logic between components without changing your component hierarchy.</li>
                <li>They let you split one component into smaller functions based on what pieces are related.</li>
                <li>They let you use more of React's features without classes.</li>
              </ul>
              
              <h2>Basic Hooks</h2>
              <h3>useState</h3>
              <p>The useState hook lets you add state to functional components. It returns a stateful value and a function to update it.</p>
              <pre><code>
              const [count, setCount] = useState(0);
              </code></pre>
              
              <h3>useEffect</h3>
              <p>The useEffect hook lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes, but unified into a single API.</p>
              <pre><code>
              useEffect(() => {
                document.title = \`You clicked \${count} times\`;
                
                return () => {
                  // Cleanup code
                };
              }, [count]);
              </code></pre>
              
              <h3>useContext</h3>
              <p>The useContext hook accepts a context object and returns the current context value for that context.</p>
              <pre><code>
              const value = useContext(MyContext);
              </code></pre>
              
              <h2>Additional Hooks</h2>
              <p>React also provides several additional hooks like useReducer, useCallback, useMemo, useRef, and more.</p>
              
              <h2>Custom Hooks</h2>
              <p>You can also create your own Hooks to reuse stateful behavior between different components.</p>
              
              <h2>Conclusion</h2>
              <p>React Hooks provide a more direct API to the React concepts you already know: props, state, context, refs, and lifecycle. They also offer a powerful way to compose behavior and reuse code between components.</p>
            `,
            author: {
              _id: "user123", // Match this with the userId to simulate being the author
              name: "Jane Doe",
            },
            createdAt: "2023-04-15T10:30:00Z",
            updatedAt: "2023-04-15T10:30:00Z",
          }

          setPost(mockPost)
          setIsAuthor(userId === mockPost.author._id)
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError("Failed to load post")
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  const handleDelete = async () => {
    try {
      // In a real app, you would call your API
      // await fetch(`${API_URL}/posts/${post?._id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      //   }
      // });

      // For demo purposes, we'll just simulate success
      router.push("/posts")
    } catch (err) {
      console.error("Error deleting post:", err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error || "Post not found"}</p>
          <Button asChild>
            <Link href="/posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Link>
          </Button>
        </div>
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

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
            <span>By {post.author.name}</span>
            <span>•</span>
            <span>Published {formatDate(post.createdAt)}</span>
            {post.updatedAt !== post.createdAt && (
              <>
                <span>•</span>
                <span>Updated {formatDate(post.updatedAt)}</span>
              </>
            )}
          </div>

          {isAuthor && (
            <div className="flex gap-2 mb-6">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/posts/edit/${slug}`}>
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
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  )
}
