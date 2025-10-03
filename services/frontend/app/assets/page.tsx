"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Loader2, Video, Image as ImageIcon, Music, ChevronDown, FolderOpen } from "lucide-react"
import { fetchAssets, type Asset } from '@/lib/api-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AssetsPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("latest")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/landing')
    }
  }, [mounted, isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadAssets()
    }
  }, [isAuthenticated])

  useEffect(() => {
    applyFilters()
  }, [assets, typeFilter, sortOrder])

  const loadAssets = async () => {
    try {
      setLoadingAssets(true)
      const data = await fetchAssets()
      setAssets(data)
    } catch (error) {
      console.error('Failed to load assets:', error)
    } finally {
      setLoadingAssets(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...assets]

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(asset => asset.type === typeFilter)
    }

    // Apply sorting
    if (sortOrder === "latest") {
      filtered.sort((a, b) => {
        const dateA = a.creation_date ? new Date(a.creation_date).getTime() : 0
        const dateB = b.creation_date ? new Date(b.creation_date).getTime() : 0
        return dateB - dateA
      })
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => {
        const dateA = a.creation_date ? new Date(a.creation_date).getTime() : 0
        const dateB = b.creation_date ? new Date(b.creation_date).getTime() : 0
        return dateA - dateB
      })
    }

    setFilteredAssets(filtered)
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />
      case 'audio':
        return <Music className="w-5 h-5" />
      case 'image':
        return <ImageIcon className="w-5 h-5" />
      default:
        return <FolderOpen className="w-5 h-5" />
    }
  }

  const getAssetDuration = (asset: Asset) => {
    // For now, return a placeholder duration
    // You can extend this to fetch actual duration from metadata
    return "5:00s"
  }

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

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Page Title and Filters */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">My Assets</h1>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-4">
              <Select value="all" onValueChange={() => {}}>
                <SelectTrigger className="w-[180px] bg-[#0a0a0a] border-neutral-700 text-white">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                  <SelectItem value="all">All Projects</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] bg-[#0a0a0a] border-neutral-700 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1"></div>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[160px] bg-[#0a0a0a] border-neutral-700 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assets Grid */}
            {loadingAssets ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <FolderOpen className="w-16 h-16 mb-4" />
                <p className="text-lg">No assets found</p>
                <p className="text-sm">Start creating content to see your assets here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
                  >
                    {/* Asset Image/Thumbnail */}
                    <div className="absolute inset-0">
                      {asset.type === 'image' || asset.type === 'video' ? (
                        <img
                          src={asset.link}
                          alt="Asset thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            (e.target as HTMLImageElement).src = '/dramatic-mountain-volcano-sunset-landscape.jpg'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                          {getAssetIcon(asset.type)}
                        </div>
                      )}
                    </div>

                    {/* Overlay with info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Asset Type Icon */}
                    <div className="absolute top-3 left-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm">
                      {getAssetIcon(asset.type)}
                    </div>

                    {/* Duration Badge */}
                    {asset.type === 'video' && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-xs font-medium">
                        {getAssetDuration(asset)}
                      </div>
                    )}

                    {/* Asset Date */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-neutral-300">
                        {asset.creation_date
                          ? new Date(asset.creation_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

