"use client";

import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Added Link import
import { API_URL, formatDate } from "@/lib/utils"; // Ensure formatDate is imported
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Added Button import
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // Added AlertDialog imports
import { ArrowLeft, Edit, Trash2, ThumbsUp, ThumbsDown, Bookmark as BookmarkIcon } from "lucide-react"; // Added necessary icons

// --- Child Component Imports ---
// Assuming these components exist and are correctly implemented
import PostHeader from "@/components/post/PostHeader";
import PostActions from "@/components/post/PostActions";
import CommentSection from "@/components/post/CommentSection";

// --- Interfaces (Ensure these match your API response structure) ---
interface User {
  _id: string;
  username: string;
}

interface Reply {
  _id: string;
  text: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  text: string;
  user: User;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
}

interface Like {
  user: string; // User ID
  type: 'like' | 'dislike';
}

interface Bookmark {
  user: string; // User ID
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  likes: Like[]; // Array of like objects
  bookmarks: Bookmark[]; // Array of bookmark objects
  // Add counts if your API provides them directly, otherwise calculate them
  likesCount?: number;
  dislikesCount?: number;
  bookmarkCount?: number;
}

// --- Main Page Component ---
export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Resolve the promise param using `use`
  // Remove the try/catch block around `use`
  const resolvedParams = use(params);
  // Error handling for unresolved/invalid params should rely on Suspense/Error Boundaries
  // or checks after this point (e.g., if resolvedParams.id is missing).

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);

  // State derived from 'post' and 'currentUserId' - recalculate when they change
  const [likeStatus, setLikeStatus] = useState<'like' | 'dislike' | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // --- Utility Functions ---
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null; // Guard for SSR/build time
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.warn("JWT token not found. Redirecting to login.");
      router.push('/auth/login');
      return null;
    }
    return token;
  }, [router]);

  const parseJwt = useCallback((token: string): { id: string } | null => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error("Failed to parse JWT:", e);
      localStorage.removeItem('jwt'); // Clear invalid token
      router.push('/auth/login'); // Redirect on parse failure
      return null;
    }
  }, [router]);

  // --- Effects ---

  // Effect to get User ID from token
  useEffect(() => {
    if (typeof window === 'undefined') return; // Guard for SSR/build time
    const token = localStorage.getItem('jwt'); // Don't use getToken here to avoid dependency loop/re-renders
    if (token) {
      const userData = parseJwt(token);
      if (userData) {
        setCurrentUserId(userData.id);
      } else {
         // parseJwt handles redirection if token is invalid
         setError("Invalid session. Please login again.");
         setLoading(false);
      }
    } else {
      // No token found, might need to redirect depending on page requirements
      // For viewing posts, we might allow viewing without login, but actions require it.
      // Let the fetchPost effect handle redirection if login is strictly required.
      console.log("No token found on initial load.");
    }
  }, [parseJwt]); // Depend on parseJwt


  // Effect to Fetch Post Data
  useEffect(() => {
    // Ensure resolvedParams and its id are available
    if (!resolvedParams?.id) {
        // If params are definitively missing after resolving:
        if (!loading && !post) { // Avoid setting error if still loading or post already loaded
             setError("Post ID is missing.");
             setLoading(false);
        }
        return; // Exit effect if no ID
    }

    const postId = resolvedParams.id;
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchPost = async () => {
      setLoading(true);
      setError(null); // Reset error on new fetch

      const token = localStorage.getItem('jwt'); // Get token directly

      // Decide if a token is strictly required to *view* the post
      // If viewing is public, remove this block or adjust logic
      if (!token) {
        setError("Please login to view this post."); // Or allow viewing and disable actions
        setLoading(false);
        router.push('/auth/login'); // Redirect if login is mandatory
        return;
      }

      // Attempt to get user ID again here if needed, ensure consistency
      let userId = currentUserId;
      if (!userId) {
          const userData = parseJwt(token);
          if (userData) {
              userId = userData.id;
              // No need to setCurrentUserId here if the other effect handles it,
              // but ensure userId is available for checks below.
          } else {
              // Invalid token detected during fetch
              setError("Invalid session. Please login again.");
              setLoading(false);
              return; // Exit fetch
          }
      }


      try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
          headers: {
            // Only include Authorization if token exists
            ...(token && { 'Authorization': `Bearer ${token}` }),
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwt');
            throw new Error("Session expired or invalid. Please login again.");
          }
          const errorBody = await response.text();
          console.error("Fetch post error:", response.status, errorBody);
          throw new Error(`Failed to load post (status: ${response.status})`);
        }

        const data = await response.json();
        const postData: Post = data.data || data; // Adjust based on your API response wrapper

        if (!postData || !postData._id) {
          throw new Error("Received invalid post data format from API.");
        }

        if (isMounted) {
          // Reverse comments before setting state
          if (postData.comments) {
            postData.comments = [...postData.comments].reverse();
          }
          setPost(postData);

          // --- Update derived state based on fetched post and current user ---
          const fetchedUserId = userId; // Use the userId obtained in this effect scope

          // Check if the current user is the author
          setIsAuthor(fetchedUserId === postData.author._id);

          // Calculate counts (handle potential missing arrays/fields)
          const likes = postData.likes || [];
          const bookmarks = postData.bookmarks || [];
          setLikesCount(likes.filter(l => l.type === 'like').length);
          setDislikesCount(likes.filter(l => l.type === 'dislike').length);
          setBookmarkCount(bookmarks.length);

          // Set initial like status for the current user
          const userLike = likes.find(like => like.user === fetchedUserId);
          setLikeStatus(userLike?.type || null);

          // Set initial bookmark status for the current user
          const userBookmark = bookmarks.find(bookmark => bookmark.user === fetchedUserId);
          setIsBookmarked(!!userBookmark);
          // --- End derived state update ---
        }

      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
          console.error("Error fetching post:", err);
          setError(errorMessage);
          if (errorMessage.includes("login") || errorMessage.includes("Session")) {
            router.push('/auth/login');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    // Cleanup function to prevent state updates on unmount
    return () => {
      isMounted = false;
    };
    // Dependencies: Fetch when postId changes or when currentUserId is determined.
    // REMOVED `loading` and `post` from dependencies to prevent infinite loop.
  }, [resolvedParams?.id, currentUserId, parseJwt, router]); // Corrected dependencies


  // --- API Interaction Handlers ---
  // Wrap handlers in useCallback to stabilize their identity for prop drilling

  const handleDeletePost = useCallback(async () => {
    const token = getToken();
    if (!token || !post) return;

    // Consider adding a loading state specific to this action if needed
    try {
      const response = await fetch(`${API_URL}/posts/${post._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      router.push("/posts"); // Navigate away
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err instanceof Error ? err.message : "Failed to delete post."); // Set page error
    }
  }, [post, getToken, router]);

  const handleLikeDislike = useCallback(async (type: 'like' | 'dislike') => {
    const token = getToken();
    if (!token || !post) return; // Add check for post

    // Optional: Optimistic Update (can make UI feel faster)
    // Store previous state in case of error
    const previousLikeStatus = likeStatus;
    const previousLikesCount = likesCount;
    const previousDislikesCount = dislikesCount;

    // Immediately update UI based on the action
    const newLikeStatus = previousLikeStatus === type ? null : type;
    setLikeStatus(newLikeStatus);
    if (newLikeStatus === 'like') {
        setLikesCount(prev => previousLikeStatus === 'like' ? prev -1 : prev + 1);
        if(previousLikeStatus === 'dislike') setDislikesCount(prev => prev - 1);
    } else if (newLikeStatus === 'dislike') {
        setDislikesCount(prev => previousLikeStatus === 'dislike' ? prev - 1 : prev + 1);
         if(previousLikeStatus === 'like') setLikesCount(prev => prev - 1);
    } else { // User cleared their vote
        if(previousLikeStatus === 'like') setLikesCount(prev => prev - 1);
        if(previousLikeStatus === 'dislike') setDislikesCount(prev => prev - 1);
    }


    try {
      const response = await fetch(`${API_URL}/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type }) // Send the intended type ('like' or 'dislike')
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setLikeStatus(previousLikeStatus);
        setLikesCount(previousLikesCount);
        setDislikesCount(previousDislikesCount);
        const errorData = await response.json().catch(() => ({ message: 'Failed to like/dislike post' }));
        throw new Error(errorData.message || 'Failed to like/dislike post');
      }

      // API should ideally return the updated counts and potentially the user's status
      const updatedData = await response.json();

      // Update state with data from API response for consistency
      // (Even if optimistic update was done, this ensures sync with backend)
      if (updatedData && typeof updatedData.likesCount === 'number' && typeof updatedData.dislikesCount === 'number') {
          setLikesCount(updatedData.likesCount);
          setDislikesCount(updatedData.dislikesCount);
          // Determine status based on response if possible, otherwise rely on optimistic update
          // Example: if API returns the user's current vote:
          // setLikeStatus(updatedData.currentUserVote || newLikeStatus);
      }
       // If API doesn't return counts/status, the optimistic update handles the UI change


    } catch (err) {
      console.error('Error liking/disliking post:', err);
       // Ensure reversion if fetch itself failed
       setLikeStatus(previousLikeStatus);
       setLikesCount(previousLikesCount);
       setDislikesCount(previousDislikesCount);
      setError(err instanceof Error ? err.message : "Interaction failed.");
    }
    // Removed post from dependencies, rely on specific state setters
  }, [post, getToken, setError, likeStatus, likesCount, dislikesCount]); // Added state vars needed for optimistic update/revert

  const handleBookmark = useCallback(async () => {
    const token = getToken();
    if (!token || !post) return; // Add check for post

    // Optional: Optimistic Update
    const previousIsBookmarked = isBookmarked;
    const previousBookmarkCount = bookmarkCount;
    const newIsBookmarked = !previousIsBookmarked;

    setIsBookmarked(newIsBookmarked); // Update UI immediately
    setBookmarkCount(prev => newIsBookmarked ? prev + 1 : prev - 1);


    try {
      const response = await fetch(`${API_URL}/posts/${post._id}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
         // Revert optimistic update on failure
         setIsBookmarked(previousIsBookmarked);
         setBookmarkCount(previousBookmarkCount);
        const errorData = await response.json().catch(() => ({ message: 'Failed to bookmark post' }));
        throw new Error(errorData.message || 'Failed to bookmark post');
      }

      // API should ideally return the updated count and status
      const updatedData = await response.json();

      // Update state with data from API response for consistency
       if (updatedData && typeof updatedData.bookmarkCount === 'number') {
           setBookmarkCount(updatedData.bookmarkCount);
           // Example: if API returns the user's current bookmark status:
           // setIsBookmarked(updatedData.isBookmarkedByCurrentUser ?? newIsBookmarked);
       }
       // If API doesn't return count/status, optimistic update handles UI change


    } catch (err) {
      console.error('Error bookmarking post:', err);
      // Ensure reversion if fetch itself failed
      setIsBookmarked(previousIsBookmarked);
      setBookmarkCount(previousBookmarkCount);
      setError(err instanceof Error ? err.message : "Interaction failed.");
    }
     // Removed post from dependencies, rely on specific state setters
  }, [post, getToken, setError, isBookmarked, bookmarkCount]); // Added state vars needed for optimistic update/revert

  // --- Comment/Reply Handlers ---
  const handleComment = useCallback(async (text: string) => {
    const token = getToken();
    if (!token || !post || !text.trim()) return;

    try {
      const response = await fetch(`${API_URL}/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const updatedPostData: Post = await response.json(); // Assume API returns updated post
      if (updatedPostData.comments) {
        updatedPostData.comments = [...updatedPostData.comments].reverse(); // Keep newest first
      }
      setPost(updatedPostData); // Update the entire post state

    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err instanceof Error ? err.message : "Failed to add comment.");
    }
  }, [post, getToken, setError]); // Added setError

  const handleEditComment = useCallback(async (commentId: string, text: string) => {
    const token = getToken();
    if (!token || !post || !text.trim()) return;

    try {
      const response = await fetch(`${API_URL}/posts/${post._id}/comments/${commentId}`, {
        method: 'PATCH', // Or PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Failed to update comment');

      const updatedPostData: Post = await response.json(); // Assume API returns updated post
      if (updatedPostData.comments) {
        updatedPostData.comments = [...updatedPostData.comments].reverse();
      }
      setPost(updatedPostData);

    } catch (err) {
      console.error('Error updating comment:', err);
      setError(err instanceof Error ? err.message : "Failed to update comment.");
    }
  }, [post, getToken, setError]); // Added setError

  const handleDeleteComment = useCallback(async (commentId: string) => {
    const token = getToken();
    if (!token || !post) return;

    // Optional: Optimistic update (more complex state logic)
    // setPost(prev => prev ? ({ ...prev, comments: prev.comments.filter(c => c._id !== commentId) }) : null);

    try {
      const response = await fetch(`${API_URL}/posts/${post._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        // Revert optimistic update if used
        throw new Error('Failed to delete comment');
      }

      // Update state after successful deletion (if not done optimistically)
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: prevPost.comments.filter(comment => comment._id !== commentId)
        };
      });

    } catch (err) {
      console.error('Error deleting comment:', err);
      // Revert optimistic update if used
      setError(err instanceof Error ? err.message : "Failed to delete comment.");
    }
  }, [post, getToken, setError]); // Added setError

  const handleReply = useCallback(async (commentId: string, text: string) => {
    const token = getToken();
    if (!token || !post || !text.trim()) return;

    try {
      const response = await fetch(`${API_URL}/posts/${post._id}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Failed to add reply');

      const updatedPostData: Post = await response.json(); // Assume API returns updated post
      if (updatedPostData.comments) {
        updatedPostData.comments = [...updatedPostData.comments].reverse();
      }
      setPost(updatedPostData);

    } catch (err) {
      console.error('Error adding reply:', err);
      setError(err instanceof Error ? err.message : "Failed to add reply.");
    }
  }, [post, getToken, setError]); // Added setError

  const handleEditReply = useCallback(async (commentId: string, replyId: string, text: string) => {
    const token = getToken();
    if (!token || !post || !text.trim()) return;

    try {
      const response = await fetch(`${API_URL}/posts/${post._id}/comments/${commentId}/replies/${replyId}`, {
        method: 'PATCH', // Or PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Failed to update reply');

      const updatedPostData: Post = await response.json(); // Assume API returns updated post
      if (updatedPostData.comments) {
        updatedPostData.comments = [...updatedPostData.comments].reverse();
      }
      setPost(updatedPostData);

    } catch (err) {
      console.error('Error updating reply:', err);
      setError(err instanceof Error ? err.message : "Failed to update reply.");
    }
  }, [post, getToken, setError]); // Added setError

  const handleDeleteReply = useCallback(async (commentId: string, replyId: string) => {
    const token = getToken();
    if (!token || !post) return;

    try {
      const response = await fetch(`${API_URL}/posts/${post._id}/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete reply');

      // Update state after successful deletion
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: prevPost.comments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply._id !== replyId)
              };
            }
            return comment;
          })
        };
      });

    } catch (err) {
      console.error('Error deleting reply:', err);
      setError(err instanceof Error ? err.message : "Failed to delete reply.");
    }
  }, [post, getToken, setError]); // Added setError


  // --- Render Logic ---

  if (loading) {
    return <LoadingSkeleton />;
  }

  // Display error specific to post loading, or general errors set by handlers
  if (error || !post) {
    // Pass the current error state to the display component
    return <ErrorDisplay error={error || "Post not found."} />;
  }

  // --- Main JSX ---
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">

        <PostHeader
          title={post.title}
          author={post.author}
          createdAt={post.createdAt}
          updatedAt={post.updatedAt}
          isAuthor={isAuthor}
          postId={post._id}
          onDelete={handleDeletePost}
          onBack={() => router.back()} // Use router.back()
        />

        {/* Post Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-8 break-words"
          dangerouslySetInnerHTML={{ __html: post.content }} // Ensure content is sanitized server-side!
        />

        {/* Actions: Like/Dislike/Bookmark */}
        <PostActions
          postId={post._id} // Pass postId
          likeStatus={likeStatus}
          likesCount={likesCount}
          dislikesCount={dislikesCount}
          isBookmarked={isBookmarked}
          bookmarkCount={bookmarkCount}
          onLikeDislike={handleLikeDislike}
          onBookmark={handleBookmark}
          // Add disabled state based on whether user is logged in if needed
          // disabled={!currentUserId}
        />

        {/* Comments Section */}
        <CommentSection
          postId={post._id} // Pass postId if needed by CommentSection internally
          comments={post.comments || []} // Pass comments array, default to empty array
          currentUserId={currentUserId} // Pass current user ID
          // Pass all the handlers
          onAddComment={handleComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onAddReply={handleReply}
          onEditReply={handleEditReply}
          onDeleteReply={handleDeleteReply}
          // Add disabled state based on whether user is logged in if needed
          // disabled={!currentUserId}
        />

      </div>
    </div>
  );
}

// --- Helper Components ---

function LoadingSkeleton() {
  // ... (keep existing skeleton)
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Add skeleton for actions and comments */}
        <Skeleton className="h-10 w-full mt-8 border-t pt-6" />
        <Skeleton className="h-20 w-full mt-8 border-t pt-6" />
      </div>
    </div>
  );
}

function ErrorDisplay({ error }: { error: string | null }) {
  const router = useRouter(); // Need router here too for login button
  // ... (keep existing error display, ensure Link and Button are imported)
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4 text-destructive">Error</h1>
      <p className="text-muted-foreground mb-6">{error || "An unexpected error occurred."}</p>
      <Button variant="outline" onClick={() => router.back()} className="mr-4">
         Go Back
      </Button>
      <Button variant="outline" asChild>
        <Link href="/posts">Back to Posts</Link>
      </Button>
      {/* Optionally add a login button if the error is auth-related */}
      {error && (error.includes("login") || error.includes("Session")) && (
        <Button onClick={() => router.push('/auth/login')} className="ml-4">Login</Button>
      )}
    </div>
  );
}