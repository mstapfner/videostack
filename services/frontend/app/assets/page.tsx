"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Loader2, Video, Image as ImageIcon, Music, ChevronDown, FolderOpen, Play, Download, X, Calendar, Tag } from "lucide-react"
import { fetchAllGenerations, type GenerationResponse, type GenerationListResponse } from '@/lib/api-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AssetsPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [generations, setGenerations] = useState<GenerationResponse[]>([])
  const [filteredGenerations, setFilteredGenerations] = useState<GenerationResponse[]>([])
  const [loadingGenerations, setLoadingGenerations] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("latest")
  const [totalCount, setTotalCount] = useState(0)
  const [selectedGeneration, setSelectedGeneration] = useState<GenerationResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      loadGenerations()
    }
  }, [isAuthenticated])

  useEffect(() => {
    applyFilters()
  }, [generations, typeFilter, sortOrder])

  const loadGenerations = async () => {
    try {
      setLoadingGenerations(true)
      const generationType = typeFilter !== "all" ? typeFilter : undefined
      const response = await fetchAllGenerations(0, 100, generationType)
      setGenerations(response.generations)
      setTotalCount(response.total)
    } catch (error) {
      console.error('Failed to load generations:', error)
    } finally {
      setLoadingGenerations(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...generations]

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(gen => gen.generation_type === typeFilter)
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

    setFilteredGenerations(filtered)
  }

  // Reload generations when type filter changes
  useEffect(() => {
    if (isAuthenticated) {
      loadGenerations()
    }
  }, [typeFilter])

  const getGenerationIcon = (type: string) => {
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    }
  }

  const handleGenerationClick = (generation: GenerationResponse) => {
    setSelectedGeneration(generation)
    setIsModalOpen(true)
  }

  const handleDownload = async (generation: GenerationResponse) => {
    if (!generation.generated_content_url) return

    try {
      const response = await fetch(generation.generated_content_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Set filename based on generation type
      const extension = generation.generation_type === 'image' ? 'png' : 
                       generation.generation_type === 'video' ? 'mp4' : 'mp3'
      link.download = `generation-${generation.id}.${extension}`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download file:', error)
    }
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

            {/* Generations Grid */}
            {loadingGenerations ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : filteredGenerations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <FolderOpen className="w-16 h-16 mb-4" />
                <p className="text-lg">No generations found</p>
                <p className="text-sm">Start creating content to see your generations here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGenerations.map((generation) => (
                  <div
                    key={generation.id}
                    onClick={() => handleGenerationClick(generation)}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
                  >
                    {/* Generation Media Preview */}
                    <div className="absolute inset-0">
                      {generation.status === 'completed' && generation.generated_content_url ? (
                        <>
                          {generation.generation_type === 'image' && (
                            <img
                              src={generation.generated_content_url}
                              alt={generation.prompt}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/dramatic-mountain-volcano-sunset-landscape.jpg'
                              }}
                            />
                          )}
                          {generation.generation_type === 'video' && (
                            <div className="relative w-full h-full">
                              <video
                                src={generation.generated_content_url}
                                className="w-full h-full object-cover"
                                poster={generation.first_frame}
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="p-3 rounded-full bg-black/50 backdrop-blur-sm group-hover:bg-black/70 transition-colors">
                                  <Play className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                          {generation.generation_type === 'audio' && (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                              <Music className="w-12 h-12 mb-3 text-purple-400" />
                              <p className="text-sm text-neutral-300 px-4 text-center line-clamp-2">
                                {generation.prompt}
                              </p>
                            </div>
                          )}
                        </>
                      ) : generation.status === 'processing' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-neutral-400">Processing...</p>
                          </div>
                        </div>
                      ) : generation.status === 'failed' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/20 to-neutral-900">
                          <div className="text-center px-4">
                            <p className="text-sm text-red-400 mb-1">Generation Failed</p>
                            {generation.error_message && (
                              <p className="text-xs text-neutral-500 line-clamp-2">{generation.error_message}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                          {getGenerationIcon(generation.generation_type)}
                        </div>
                      )}
                    </div>

                    {/* Overlay with info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Type Icon */}
                    <div className="absolute top-3 left-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm">
                      {getGenerationIcon(generation.generation_type)}
                    </div>

                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm ${getStatusBadgeColor(generation.status)}`}>
                      {generation.status.charAt(0).toUpperCase() + generation.status.slice(1)}
                    </div>

                    {/* Prompt and Date */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm text-white font-medium line-clamp-2 mb-1">
                        {generation.prompt}
                      </p>
                      <p className="text-xs text-neutral-300">
                        {generation.creation_date
                          ? new Date(generation.creation_date).toLocaleDateString('en-US', {
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

      {/* Generation Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-800 text-white">
          {selectedGeneration && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  {getGenerationIcon(selectedGeneration.generation_type)}
                  <span className="capitalize">{selectedGeneration.generation_type} Generation</span>
                </DialogTitle>
                <DialogDescription className="text-neutral-400">
                  View details and download your generated content
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Media Preview */}
                <div className="relative rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                  {selectedGeneration.status === 'completed' && selectedGeneration.generated_content_url ? (
                    <>
                      {selectedGeneration.generation_type === 'image' && (
                        <img
                          src={selectedGeneration.generated_content_url}
                          alt={selectedGeneration.prompt}
                          className="w-full h-auto max-h-[500px] object-contain"
                        />
                      )}
                      {selectedGeneration.generation_type === 'video' && (
                        <video
                          src={selectedGeneration.generated_content_url}
                          controls
                          className="w-full h-auto max-h-[500px]"
                          poster={selectedGeneration.first_frame}
                        />
                      )}
                      {selectedGeneration.generation_type === 'audio' && (
                        <div className="p-12 flex flex-col items-center justify-center">
                          <Music className="w-20 h-20 mb-6 text-purple-400" />
                          <audio
                            src={selectedGeneration.generated_content_url}
                            controls
                            className="w-full max-w-md"
                          />
                        </div>
                      )}
                    </>
                  ) : selectedGeneration.status === 'processing' ? (
                    <div className="p-12 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-lg text-neutral-400">Processing...</p>
                      </div>
                    </div>
                  ) : selectedGeneration.status === 'failed' ? (
                    <div className="p-12 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg text-red-400 mb-2">Generation Failed</p>
                        {selectedGeneration.error_message && (
                          <p className="text-sm text-neutral-500">{selectedGeneration.error_message}</p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">Status:</span>
                    <div className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusBadgeColor(selectedGeneration.status)}`}>
                      {selectedGeneration.status.charAt(0).toUpperCase() + selectedGeneration.status.slice(1)}
                    </div>
                  </div>

                  {/* Prompt */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm font-medium text-neutral-400">Prompt</span>
                    </div>
                    <p className="text-white bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                      {selectedGeneration.prompt}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-400">Created</span>
                      </div>
                      <p className="text-white">
                        {selectedGeneration.creation_date
                          ? new Date(selectedGeneration.creation_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-400">Updated</span>
                      </div>
                      <p className="text-white">
                        {selectedGeneration.updated_date
                          ? new Date(selectedGeneration.updated_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* ID */}
                  <div>
                    <span className="text-sm text-neutral-400">Generation ID: </span>
                    <span className="text-xs text-neutral-500 font-mono">{selectedGeneration.id}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                  <Button
                    onClick={() => handleDownload(selectedGeneration)}
                    disabled={selectedGeneration.status !== 'completed' || !selectedGeneration.generated_content_url}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="border-neutral-700 text-white hover:bg-neutral-800"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

