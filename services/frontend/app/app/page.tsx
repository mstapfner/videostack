"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from "@/components/sidebar"
import { RecentProjects } from "@/components/recent-projects"
import { StartNewProject } from "@/components/start-new-project"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Loader2 } from "lucide-react"

export default function AppPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/landing')
    }
  }, [mounted, isLoading, isAuthenticated, router])

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
        <header className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-b border-neutral-800">
          <Link href="/storyboard/new/concept">
            <Button className="bg-transparent border border-neutral-700 hover:bg-neutral-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Start New Project
            </Button>
          </Link>
          <Link href="/profile">
            <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
              <AvatarImage src={user?.profilePictureUrl || "/diverse-user-avatars.png"} />
              <AvatarFallback>
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <RecentProjects />
          <StartNewProject />
        </div>
      </main>
    </div>
  )
}

