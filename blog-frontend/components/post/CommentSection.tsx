import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2, CornerDownRight, Send } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Re-define interfaces needed within this component or import them
// Ensure these match the definitions in page.tsx or a shared types file
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

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId: string | null;
  onAddComment: (text: string) => Promise<void>;
  onEditComment: (commentId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onAddReply: (commentId: string, text: string) => Promise<void>;
  onEditReply: (commentId: string, replyId: string, text: string) => Promise<void>;
  onDeleteReply: (commentId: string, replyId: string) => Promise<void>;
  disabled?: boolean; // e.g., disable commenting if not logged in
}

// --- Individual Comment/Reply Component ---
// Breaking down the UI into smaller components can be helpful
function CommentItem({
  item, // Can be Comment or Reply
  type, // 'comment' or 'reply'
  commentId, // Only needed for replies
  currentUserId,
  onEdit,
  onDelete,
  onReply, // Only for comments
  replyCount, // Add replyCount prop
}: {
  item: Comment | Reply;
  type: 'comment' | 'reply';
  commentId?: string; // ID of the parent comment if this is a reply
  currentUserId: string | null;
  onEdit: (id: string, text: string, parentId?: string) => void; // parentId for replies
  onDelete: (id: string, parentId?: string) => void; // parentId for replies
  onReply?: (commentId: string) => void; // Function to trigger reply form display
  replyCount?: number; // Make replyCount optional
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const isOwner = currentUserId === item.user._id;
  const displayDate = item.createdAt === item.updatedAt ? formatDate(item.createdAt) : `Edited ${formatDate(item.updatedAt)}`;

  const handleSaveEdit = () => {
    if (editText.trim() === item.text || !editText.trim()) {
      setIsEditing(false);
      setEditText(item.text); // Reset if unchanged or empty
      return;
    }
    onEdit(item._id, editText.trim(), commentId); // Pass commentId if it's a reply edit
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(item.text);
  };

  return (
    <div className={`flex gap-3 ${type === 'reply' ? 'ml-8 mt-4' : 'mt-6'}`}>
      <Avatar className="h-8 w-8">
        {/* Add Avatar logic if you have user avatars */}
        <AvatarFallback>{item.user.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm mb-1">
          <span className="font-semibold">{item.user.username}</span>
          <span className="text-xs text-muted-foreground">
            <time dateTime={item.updatedAt}>{displayDate}</time>
          </span>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm break-words whitespace-pre-wrap">{item.text}</p>
        )}
        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          {/* Modify Reply button */}
          {type === 'comment' && onReply && currentUserId && (
            <button onClick={() => onReply(item._id)} className="hover:text-primary">
              Reply {replyCount !== undefined && replyCount > 0 ? `(${replyCount})` : ''}
            </button>
          )}
          {/* Edit/Delete buttons */}
          {isOwner && !isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} className="hover:text-primary">Edit</button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="hover:text-destructive">Delete</button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {type}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Are you sure you want to delete this {type}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(item._id, commentId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Comment Section Component ---
export default function CommentSection({
  postId,
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onAddReply,
  onEditReply,
  onDeleteReply,
  disabled = false,
}: CommentSectionProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // Keep this state
  const [replyText, setReplyText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);

  const handlePostComment = async () => {
    if (!newCommentText.trim() || disabled || loadingComment) return;
    setLoadingComment(true);
    try {
      await onAddComment(newCommentText.trim());
      setNewCommentText(''); // Clear input on success
    } catch (error) {
      console.error("Failed to post comment:", error);
      // Optionally show an error message to the user
    } finally {
      setLoadingComment(false);
    }
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || !replyingTo || disabled || loadingReply) return;
    setLoadingReply(true);
    try {
      await onAddReply(replyingTo, replyText.trim());
      setReplyText(''); // Clear input
      // REMOVED: setReplyingTo(null); // Close reply form
    } catch (error) {
      console.error("Failed to post reply:", error);
      // Optionally show an error message
    } finally {
      setLoadingReply(false);
    }
  };

  const handleEdit = (id: string, text: string, parentId?: string) => {
    if (parentId) { // It's a reply
      onEditReply(parentId, id, text);
    } else { // It's a comment
      onEditComment(id, text);
    }
  };

  const handleDelete = (id: string, parentId?: string) => {
     if (parentId) { // It's a reply
      onDeleteReply(parentId, id);
    } else { // It's a comment
      onDeleteComment(id);
    }
  };

  // Keep this function to toggle the visibility state
  const toggleReplyForm = (commentId: string) => {
    setReplyingTo(prev => (prev === commentId ? null : commentId)); // If clicking the same comment's reply button, hide; otherwise, show.
    setReplyText(''); // Clear reply text when toggling
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-semibold mb-6">Comments ({comments.length})</h2>

      {/* Add Comment Form */}
      {currentUserId && !disabled && (
        <div className="mb-8">
          <Textarea
            placeholder="Add a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            rows={3}
            className="mb-2"
            disabled={loadingComment}
          />
          <Button
            onClick={handlePostComment}
            disabled={!newCommentText.trim() || loadingComment}
            size="sm"
          >
            {loadingComment ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      )}
      {!currentUserId && (
         <p className="text-sm text-muted-foreground mb-8">Please log in to add comments.</p>
      )}


      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => {
            // Calculate reply count here
            const currentReplyCount = comment.replies?.length || 0;

            return (
              <div key={comment._id} className="border-b pb-6 last:border-b-0">
                <CommentItem
                  item={comment}
                  type="comment"
                  currentUserId={currentUserId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReply={toggleReplyForm}
                  replyCount={currentReplyCount} // Pass the count down
                />

                {/* Conditionally render the container for replies and the reply form */}
                {replyingTo === comment._id && (
                  <div className="pl-8 mt-4 border-l-2 border-muted"> {/* Container for replies */}

                    {/* --- ADDING REPLY FORM BACK --- */}
                    {/* Reply Form (Ensure this is present and placed correctly) */}
                    {currentUserId && !disabled && (
                      <div className="ml-8 mt-4 mb-4 flex gap-3"> {/* Added mb-4 for spacing below form */}
                        <Avatar className="h-8 w-8">
                          {/* Add Avatar logic if you have user avatars */}
                          <AvatarFallback>{/* Current user initial */}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder={`Replying to ${comment.user.username}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            className="text-sm"
                            disabled={loadingReply}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handlePostReply}
                              disabled={!replyText.trim() || loadingReply}
                            >
                              {loadingReply ? 'Replying...' : 'Post Reply'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* --- END OF REPLY FORM --- */}


                    {/* Replies List (Remains below the form) */}
                     {comment.replies && comment.replies.length > 0 && (
                       <div className="space-y-4">
                         {comment.replies.map((reply) => (
                           <CommentItem
                             key={reply._id}
                             item={reply}
                             type="reply"
                             commentId={comment._id}
                             currentUserId={currentUserId}
                             onEdit={handleEdit}
                             onDelete={handleDelete}
                             // No replyCount needed for reply items
                           />
                         ))}
                       </div>
                     )}
                  </div> // End of conditional container
                )}
              </div> // End of comment container
            );
          }) // End of comments.map
        ) : (
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}