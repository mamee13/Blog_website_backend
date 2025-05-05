import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils"; // Assuming formatDate is in utils

interface User {
  _id: string;
  username: string;
}

interface PostHeaderProps {
  title: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  isAuthor: boolean;
  postId: string;
  onDelete: () => void; // Function to handle deletion
  onBack: () => void; // Function to handle going back
}

export default function PostHeader({
  title,
  author,
  createdAt,
  updatedAt,
  isAuthor,
  postId,
  onDelete,
  onBack
}: PostHeaderProps) {
  const displayDate = createdAt === updatedAt ? formatDate(createdAt) : `Updated ${formatDate(updatedAt)}`;

  return (
    <header className="mb-8 border-b pb-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {isAuthor && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              {/* Correct the href path */}
              <Link href={`/posts/edit/${postId}`} className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  {/* Call the onDelete prop when confirmed */}
                  <AlertDialogAction onClick={onDelete}>
                    Delete Post
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-3 break-words">{title}</h1>
      <div className="text-sm text-muted-foreground">
        <span>By {author?.username || 'Unknown Author'}</span>
        <span className="mx-2">•</span>
        <time dateTime={updatedAt}>{displayDate}</time>
      </div>
    </header>
  );
}