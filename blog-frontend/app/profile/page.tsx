"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API_URL } from "@/lib/utils"
import { ThumbsUp, ThumbsDown, MessageSquare, Bookmark, Calendar } from "lucide-react"

// Add this function before the interfaces
const stripHtmlTags = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

interface User {
  _id: string
  username: string
  email: string
}

interface Post {
  _id: string
  title: string
  content: string
  summary: string
  createdAt: string
  slug: string
  likesCount: number
  dislikesCount: number
  commentsCount: number
  bookmarksCount: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("") // <-- changed from name/setName
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState("")
  const [updateError, setUpdateError] = useState("")
  const [updateLoading, setUpdateLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("jwt")
    if (!token) {
      router.push("/auth/login")
      return
    }

    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const userResponse = await fetch(`${API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const userData = await userResponse.json()
        if (!userResponse.ok) throw new Error(userData.message || "Failed to load profile data")
        
        // Fetch user posts
        const postsResponse = await fetch(`${API_URL}/posts/my-posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const postsData = await postsResponse.json()
        
        setUser(userData.data.user)
        setUsername(userData.data.user.username)
        setEmail(userData.data.user.email)
        setPosts(postsData.data.posts || [])
        setLoading(false)
      } catch (err) {
        setError("Failed to load profile data")
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateSuccess("")
    setUpdateError("")
    setUpdateLoading(true)

    try {
      const token = localStorage.getItem("jwt")
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username, email }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }
      setUpdateSuccess("Profile updated successfully")
      setUser(data.data.user)
      setUsername(data.data.user.username)
      setEmail(data.data.user.email)
      setUpdateLoading(false)
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "An error occurred while updating profile")
      setUpdateLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateSuccess("")
    setUpdateError("")

    if (newPassword !== passwordConfirm) {
      setUpdateError("New passwords do not match")
      return
    }

    setUpdateLoading(true)

    try {
      const token = localStorage.getItem("jwt")
      const response = await fetch(`${API_URL}/users/update-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          passwordCurrent: currentPassword,
          password: newPassword,
          passwordConfirm
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update password")
      }

      setUpdateSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setPasswordConfirm("")
      setUpdateLoading(false)
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "An error occurred while updating password")
      setUpdateLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Loading profile...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
            <TabsTrigger value="posts">Your Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {updateSuccess && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>{updateSuccess}</AlertDescription>
                    </Alert>
                  )}

                  {updateError && (
                    <Alert variant="destructive">
                      <AlertDescription>{updateError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <Button type="submit" disabled={updateLoading}>
                    {updateLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {updateSuccess && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>{updateSuccess}</AlertDescription>
                    </Alert>
                  )}

                  {updateError && (
                    <Alert variant="destructive">
                      <AlertDescription>{updateError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">Confirm New Password</Label>
                    <Input
                      id="passwordConfirm"
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={updateLoading}>
                    {updateLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Your Posts</CardTitle>
                <CardDescription>Manage your published content</CardDescription>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't created any posts yet</p>
                    <Button asChild>
                      <Link href="/posts/create">Create Your First Post</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post._id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {stripHtmlTags(post.content).substring(0, 150)}...
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/posts/${post._id}`}>View</Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/posts/edit/${post._id}`}>Edit</Link>
                            </Button>
                          </div>
                      
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {post.likesCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsDown className="w-4 h-4" />
                              {post.dislikesCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.commentsCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark className="w-4 h-4" />
                              {post.bookmarksCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4">
                      <Button asChild>
                        <Link href="/posts/create">Create New Post</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} // Remove the extra closing brace here - there should only be one closing brace for the ProfilePage component
