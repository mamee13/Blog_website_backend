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

interface User {
  _id: string
  name: string
  email: string
}

interface Post {
  _id: string
  title: string
  summary: string
  createdAt: string
  slug: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
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
        // In a real app, you would fetch from your API
        // const response = await fetch(`${API_URL}/users/me`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          const mockUser = {
            _id: "user123",
            name: "John Doe",
            email: "john@example.com",
          }

          const mockPosts = [
            {
              _id: "1",
              title: "Getting Started with React Hooks",
              summary: "Learn how to use React Hooks to simplify your components and manage state effectively.",
              createdAt: "2023-04-15T10:30:00Z",
              slug: "getting-started-with-react-hooks",
            },
            {
              _id: "2",
              title: "Building RESTful APIs with Node.js",
              summary: "A comprehensive guide to building scalable and maintainable APIs using Node.js and Express.",
              createdAt: "2023-04-10T14:20:00Z",
              slug: "building-restful-apis-with-nodejs",
            },
          ]

          setUser(mockUser)
          setName(mockUser.name)
          setEmail(mockUser.email)
          setPosts(mockPosts)
          setLoading(false)
        }, 1000)
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
      // In a real app, you would call your API
      // const response = await fetch(`${API_URL}/users/updateMe`, {
      //   method: "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${localStorage.getItem("jwt")}`
      //   },
      //   body: JSON.stringify({ name, email }),
      // });
      //
      // const data = await response.json();
      //
      // if (!response.ok) {
      //   throw new Error(data.message || "Failed to update profile");
      // }

      // For demo purposes, we'll just simulate success
      setTimeout(() => {
        setUpdateSuccess("Profile updated successfully")
        setUpdateLoading(false)
      }, 1000)
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
      // In a real app, you would call your API
      // const response = await fetch(`${API_URL}/users/updateMyPassword`, {
      //   method: "PATCH",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${localStorage.getItem("jwt")}`
      //   },
      //   body: JSON.stringify({
      //     passwordCurrent: currentPassword,
      //     password: newPassword,
      //     passwordConfirm
      //   }),
      // });
      //
      // const data = await response.json();
      //
      // if (!response.ok) {
      //   throw new Error(data.message || "Failed to update password");
      // }

      // For demo purposes, we'll just simulate success
      setTimeout(() => {
        setUpdateSuccess("Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setPasswordConfirm("")
        setUpdateLoading(false)
      }, 1000)
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
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
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
                        <p className="text-sm text-muted-foreground mb-4">{post.summary}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/posts/${post.slug}`}>View</Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/posts/edit/${post.slug}`}>Edit</Link>
                          </Button>
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
}
