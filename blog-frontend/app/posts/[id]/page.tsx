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
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Bookmark } from "lucide-react"
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


// Add Like interface
interface Like {
  user: string
  type: 'like' | 'dislike'
}

// Add Bookmark interface after Like interface
interface Bookmark {
  user: string
  createdAt: string
  _id: string
  id: string
}

// Update Post interface to include comments
// Update the Comment interface to handle both structures
interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
  } | string; // Can be either an object or just the ID
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  category: string;
  likes: Like[];
  likesCount: number;
  dislikesCount: number;
  bookmarks: Bookmark[];
  bookmarkCount: number;
  comments: Comment[];  // Add this line
}

// Add new state for comments
export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthor, setIsAuthor] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeStatus, setLikeStatus] = useState<'like' | 'dislike' | null>(null)
  const [likesCount, setLikesCount] = useState(0)
  const [dislikesCount, setDislikesCount] = useState(0)
  const [bookmarkCount, setBookmarkCount] = useState(0)
  // Add comment state
  const [commentText, setCommentText] = useState("")

  // Add handleComment function
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jwt');
      if (!token || !post) return;

      const response = await fetch(`${API_URL}/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const updatedPost = await response.json();
      // Reverse the comments array to show newest first
      updatedPost.comments = updatedPost.comments.reverse();
      setPost(updatedPost);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('jwt')
      if (!token || !post) return

      setIsBookmarked(!isBookmarked)
      setBookmarkCount(prev => isBookmarked ? prev - 1 : prev + 1)

      const response = await fetch(`${API_URL}/posts/${post._id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to toggle bookmark')
        setIsBookmarked(isBookmarked) // Revert on error
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err)
      setIsBookmarked(isBookmarked) // Revert on error
    }
  }

  const handleLikeDislike = async (type: 'like' | 'dislike') => {
    try {
      const token = localStorage.getItem('jwt')
      if (!token || !post) return

      // Optimistically update UI first
      const newLikeStatus = likeStatus === type ? null : type
      setLikeStatus(newLikeStatus)

      const response = await fetch(`${API_URL}/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', errorText)
        throw new Error('Failed to update like status')
      }

      // Get updated likes count
      const likesResponse = await fetch(`${API_URL}/posts/${post._id}/likes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!likesResponse.ok) {
        throw new Error('Failed to fetch updated likes count')
      }

      const { data } = await likesResponse.json()

      // Update states with the actual data from server
      setLikesCount(data.likesCount)
      setDislikesCount(data.dislikesCount)

      // Update post state with new data
      if (post) {
        setPost({
          ...post,
          likes: data.likes,
          likesCount: data.likesCount,
          dislikesCount: data.dislikesCount
        })
      }
    } catch (err) {
      console.error('Error updating like status:', err)
      // Revert optimistic update on error
      setLikeStatus(likeStatus)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token || !post) return;

      // Use post._id instead of resolvedParams.id
      const response = await fetch(`${API_URL}/posts/${post._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Update the post state to remove the deleted comment
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: prevPost.comments.filter(comment => comment._id !== commentId)
        };
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };


  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('jwt')

        if (!token) {
          throw new Error("Please login to view this post")
        }

        const response = await fetch(`${API_URL}/posts/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${token.trim()}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.status === 401 || response.status === 403) {
          throw new Error("Please login again to view this post")
        }

        if (!response.ok) throw new Error("Failed to load post")

        const data = await response.json()
        const postData = data.post || data
        setPost(postData)

        // Initialize like counts and status
        setLikesCount(postData.likesCount || 0)
        setDislikesCount(postData.dislikesCount || 0)
        setBookmarkCount(postData.bookmarkCount || 0)  // Add this

        // Get user ID from token
        const tokenData = JSON.parse(atob(token.split('.')[1]))
        setIsAuthor(tokenData.id === postData.author._id)

        // Set initial like status
        const userLike = postData.likes?.find((like: Like) => like.user === tokenData.id)
        setLikeStatus(userLike?.type || null)

        // Set initial bookmark status
        const userBookmark = postData.bookmarks?.find((bookmark: Bookmark) => bookmark.user === tokenData.id)
        setIsBookmarked(!!userBookmark)  // Add this

        setLoading(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load post"
        setError(errorMessage)
        setLoading(false)

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
          className="prose prose-lg dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post?.content || '' }}
        />

        {/* Like/dislike buttons moved to bottom */}
        <div className="flex items-center gap-4 mt-8 border-t pt-6">
          <Button
            variant={likeStatus === 'like' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLikeDislike('like')}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{likesCount}</span>
          </Button>

          <Button
            variant={likeStatus === 'dislike' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLikeDislike('dislike')}
            className="flex items-center gap-2"
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{dislikesCount}</span>
          </Button>

          <Button
            variant={isBookmarked ? 'default' : 'outline'}
            size="sm"
            onClick={handleBookmark}
            className="flex items-center gap-2 ml-auto"
          >
            <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            <span>{bookmarkCount}</span>
          </Button>
        </div>
        {/* Add comments section */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>

          {/* Comment form */}
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="Write a comment..."
              rows={3}
            />
            <Button type="submit" disabled={!commentText.trim()}>
              Add Comment
            </Button>
          </form>

          {/* Comments list */}
          <div className="space-y-4">
            {post?.comments?.length === 0 ? (
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            ) : (
              // Update the comment mapping logic
              post?.comments?.map((comment) => {
                const token = localStorage.getItem('jwt');
                const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
                // Handle both object and string user types
                const commentUserId = typeof comment.user === 'string' ? comment.user : comment.user._id;
                const isCommentAuthor = userId === commentUserId;
                const username = typeof comment.user === 'string' ? 'User' : comment.user.username;

                return (
                  <div key={comment._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold">{username}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      {isCommentAuthor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}