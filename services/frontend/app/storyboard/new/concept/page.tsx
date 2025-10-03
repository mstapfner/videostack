"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mic, Sparkles, Loader2, LogIn } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { generateStoryboardOptions } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

export default function ConceptPage() {
  const router = useRouter()
  const { isAuthenticated, login, isLoading: authLoading } = useAuth()
  const [concept, setConcept] = useState(
    "",
  )
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Auto-login for demo purposes - in production you'd redirect to login page
      login()
    }
  }, [isAuthenticated, authLoading, login])

  const handleGenerate = async () => {
    if (!concept.trim() || !isAuthenticated) return

    setIsLoading(true)
    try {
      const storyboardOptions = await generateStoryboardOptions(concept)

      // Store the original concept in localStorage for reference
      if (typeof window !== 'undefined') {
        localStorage.setItem('storyboard_original_concept', concept)
      }

      // Encode the storyboard options as a URL parameter
      const encodedOptions = encodeURIComponent(JSON.stringify(storyboardOptions))
      router.push(`/storyboard/new/storyline?options=${encodedOptions}`)
    } catch (error) {
      console.error("Failed to generate storyboard options:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="flex items-center gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/blue-gradient-v-logo.jpg" alt="Video Stack AI" fill className="object-contain" />
            </div>
          </Link>
          <div className="h-8 w-px bg-neutral-700" />
          <Link href="/" className="flex items-center gap-2 text-white hover:text-neutral-300">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Untitled Project</span>
          </Link>
          <div className="flex items-center gap-2 ml-auto text-sm">
            <span className="text-white">Concept</span>
            <span className="text-neutral-600">&gt;</span>
            <Link href="/storyboard/new/storyline" className="text-neutral-600 hover:text-neutral-400">Storyline</Link>
            <span className="text-neutral-600">&gt;</span>
            <Link href="/storyboard/new/editor" className="text-neutral-600 hover:text-neutral-400">Breakdown</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold leading-tight text-balance">Storytelling at unreasonable speed</h1>
            <p className="text-neutral-400 text-lg">Quick turn a concept or script to a fully developed video</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="min-h-[140px] bg-transparent border-2 border-blue-500 rounded-lg p-4 text-white resize-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
                placeholder="Enter your concept or script here..."
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-3 right-3 text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <Mic className="w-5 h-5" />
              </Button>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !concept.trim() || !isAuthenticated || authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : authLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : !isAuthenticated ? (
                <LogIn className="w-5 h-5 mr-2" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isLoading ? "Generating..." : authLoading ? "Authenticating..." : !isAuthenticated ? "Login Required" : "Generate Video Storyboard"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
