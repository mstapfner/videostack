"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Sparkles, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const loremParagraph =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

export default function StorylinePage() {
  const router = useRouter()
  const [projectContent, setProjectContent] = useState(`${loremParagraph}\n\n${loremParagraph}\n\n${loremParagraph}`)
  const [selectedStoryline, setSelectedStoryline] = useState(0)

  const storylines = [
    {
      id: 0,
      title: "Project Title",
      description:
        "Organizations are the top level entities that are used to group your applications and manage organization specific resource (e.g., databases, cache, queues)",
    },
    {
      id: 1,
      title: "Alternative Storyline title 1",
      description:
        "Organizations are the top level entities that are used to group your applications and manage organization specific resource (e.g., databases, cache, queues)",
    },
  ]

  const handleGenerateStoryboard = () => {
    // Navigate to next step or show success
    console.log("[v0] Generating storyboard...")
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
          <Link href="/storyboard/new/concept" className="flex items-center gap-2 text-white hover:text-neutral-300">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Project Title...</span>
          </Link>
          <div className="flex items-center gap-2 ml-auto text-sm">
            <span className="text-neutral-400">Concept</span>
            <span className="text-neutral-400">&gt;</span>
            <span className="text-white">Storyline</span>
            <span className="text-neutral-600">&gt;</span>
            <span className="text-neutral-600">Breakdown</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Project Content */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold">Project Title</h2>
            <div className="relative">
              <Textarea
                value={projectContent}
                onChange={(e) => setProjectContent(e.target.value)}
                className="min-h-[500px] bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-white resize-none focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
              />
              <div className="absolute bottom-4 right-4 text-sm text-neutral-500">{projectContent.length}/2000</div>
            </div>
          </div>

          {/* Right Column - Alternative Storylines */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Alternative Storylines</h2>
            <div className="space-y-4">
              {storylines.map((storyline) => (
                <Card
                  key={storyline.id}
                  onClick={() => setSelectedStoryline(storyline.id)}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedStoryline === storyline.id
                      ? "bg-neutral-900 border-2 border-blue-500"
                      : "bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-3">{storyline.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{storyline.description}</p>
                </Card>
              ))}

              <Button
                variant="outline"
                className="w-full border-neutral-700 hover:bg-neutral-800 text-white bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Change More Alternatives
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between max-w-7xl mx-auto mt-12">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-neutral-700 hover:bg-neutral-800 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleGenerateStoryboard} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Storyboard
          </Button>
        </div>
      </main>
    </div>
  )
}
