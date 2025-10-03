"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mic, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ConceptPage() {
  const router = useRouter()
  const [concept, setConcept] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  )

  const handleGenerate = () => {
    router.push("/storyboard/new/storyline")
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
            <span className="text-neutral-400">Concept</span>
            <span className="text-neutral-600">&gt;</span>
            <span className="text-neutral-600">Storyline</span>
            <span className="text-neutral-600">&gt;</span>
            <span className="text-neutral-600">Breakdown</span>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Video Storyboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
