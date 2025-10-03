"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, LogOut, Mail, User } from "lucide-react"

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/landing')
    }
  }, [mounted, isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return
      
      const token = localStorage.getItem('access_token')
      if (!token) return

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      } finally {
        setLoadingProfile(false)
      }
    }

    if (mounted && isAuthenticated) {
      fetchUserProfile()
    }
  }, [mounted, isAuthenticated])

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h1 className="text-2xl font-semibold">Profile</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={userProfile?.profile_picture_url || "/diverse-user-avatars.png"} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-white">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email?.split('@')[0] || 'User'}
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                      Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Account Information */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <div>
                    <div className="text-sm text-neutral-400">Email</div>
                    <div className="text-white">{user?.email || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-neutral-400" />
                  <div>
                    <div className="text-sm text-neutral-400">Name</div>
                    <div className="text-white">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : 'Not provided'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-neutral-400 mb-2">Current Plan</div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0 text-sm px-3 py-1">
                      Paid Tier (Hackathon-only)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={logout}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

