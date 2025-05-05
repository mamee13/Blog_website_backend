import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Bookmark as BookmarkIcon } from "lucide-react"; // Renamed Bookmark to BookmarkIcon to avoid conflict
import { API_URL } from "@/lib/utils";
import { useRouter } from "next/navigation"; // Added for potential redirect on auth error

interface PostActionsProps {
  postId: string;
  likeStatus: 'like' | 'dislike' | null;
  likesCount: number;
  dislikesCount: number;
  isBookmarked: boolean;
  bookmarkCount: number;
  onLikeDislike: (type: 'like' | 'dislike') => Promise<void>; // Make handlers async if they perform async operations in parent
  onBookmark: () => Promise<void>; // Make handlers async
  disabled?: boolean; // Optional disabled state (e.g., if user not logged in)
}

export default function PostActions({
  postId,
  likeStatus,
  likesCount,
  dislikesCount,
  isBookmarked,
  bookmarkCount,
  onLikeDislike,
  onBookmark,
  disabled = false // Default to false
}: PostActionsProps) {
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const router = useRouter(); // Initialize router

  const handleLikeClick = async (type: 'like' | 'dislike') => {
    if (loadingLike || disabled) return;
    setLoadingLike(true);
    try {
      await onLikeDislike(type); // Call the handler passed from the parent
    } catch (error) {
      console.error(`Error during ${type}:`, error);
      // Handle error display if needed within this component, or let parent handle it
      if (error instanceof Error && (error.message.includes("login") || error.message.includes("Session"))) {
        router.push('/auth/login'); // Redirect if auth error
      } else {
        // Optionally show a local error message/toast
      }
    } finally {
      setLoadingLike(false);
    }
  };

  const handleBookmarkClick = async () => {
    if (loadingBookmark || disabled) return;
    setLoadingBookmark(true);
    try {
      await onBookmark(); // Call the handler passed from the parent
    } catch (error) {
      console.error("Error during bookmark:", error);
      // Handle error display
       if (error instanceof Error && (error.message.includes("login") || error.message.includes("Session"))) {
        router.push('/auth/login'); // Redirect if auth error
      } else {
         // Optionally show a local error message/toast
      }
    } finally {
      setLoadingBookmark(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-8 border-t pt-6">
      {/* Like Button */}
      <Button
        variant={likeStatus === 'like' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLikeClick('like')}
        className="flex items-center gap-2"
        aria-label={`Like post (${likesCount} likes)`}
        disabled={loadingLike || loadingBookmark || disabled} // Disable if any action is loading or component is disabled
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{likesCount}</span>
      </Button>

      {/* Dislike Button */}
      <Button
        variant={likeStatus === 'dislike' ? 'destructive' : 'outline'}
        size="sm"
        onClick={() => handleLikeClick('dislike')}
        className="flex items-center gap-2"
        aria-label={`Dislike post (${dislikesCount} dislikes)`}
        disabled={loadingLike || loadingBookmark || disabled}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{dislikesCount}</span>
      </Button>

      {/* Bookmark Button */}
      <Button
        variant={isBookmarked ? 'default' : 'outline'}
        size="sm"
        onClick={handleBookmarkClick}
        className="flex items-center gap-2 ml-auto" // ml-auto pushes it to the right
        aria-label={`${isBookmarked ? 'Remove bookmark' : 'Bookmark post'} (${bookmarkCount} bookmarks)`}
        disabled={loadingLike || loadingBookmark || disabled}
      >
        <BookmarkIcon className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
        <span>{bookmarkCount}</span>
      </Button>
    </div>
  );
}