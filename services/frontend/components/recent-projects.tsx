"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { getUserStoryboards, StoryboardSummary } from "@/lib/api-client"
import { Loader2, Film } from "lucide-react"
import { useStoryboardStore } from "@/store/storyboard"

export function RecentProjects() {
  const [storyboards, setStoryboards] = useState<StoryboardSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setStoryboardId } = useStoryboardStore()

  useEffect(() => {
    async function fetchStoryboards() {
      try {
        setIsLoading(true)
        const data = await getUserStoryboards(0, 4) // Fetch latest 4 storyboards
        setStoryboards(data.storyboards)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch storyboards:", err)
        setError("Failed to load recent projects")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoryboards()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  const handleStoryboardClick = (storyboardId: string) => {
    setStoryboardId(storyboardId)
  }

  if (isLoading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
        <div className="text-center py-12">
          <p className="text-neutral-500">{error}</p>
        </div>
      </section>
    )
  }

  if (storyboards.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
        <div className="text-center py-12 border border-dashed border-neutral-800 rounded-lg">
          <Film className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
          <p className="text-neutral-500 mb-2">No storyboards yet</p>
          <p className="text-neutral-600 text-sm">Create your first storyboard to get started</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {storyboards.map((storyboard) => (
          <Link 
            key={storyboard.id} 
            href={`/storyboard/new/editor`}
            onClick={() => handleStoryboardClick(storyboard.id)}
          >
            <Card className="bg-neutral-900 border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors cursor-pointer group">
              <div className="aspect-video relative bg-neutral-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                <Film className="w-12 h-12 text-neutral-600 group-hover:text-neutral-500 transition-colors" />
                {storyboard.scene_count > 0 && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {storyboard.scene_count} {storyboard.scene_count === 1 ? 'scene' : 'scenes'}
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-white font-medium mb-1 text-sm truncate" title={storyboard.title || 'Untitled'}>
                  {storyboard.title || 'Untitled Storyboard'}
                </h3>
                <p className="text-neutral-500 text-xs">{formatDate(storyboard.creation_date)}</p>
                {storyboard.status && (
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      storyboard.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      storyboard.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-neutral-500/20 text-neutral-400'
                    }`}>
                      {storyboard.status}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
