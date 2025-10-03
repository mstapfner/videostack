"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Sparkles, RefreshCw, Edit3, Check, X, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createStoryboard, generateStoryboardScenes } from "@/lib/api-client"
import { useStoryboardStore } from "@/store/storyboard"

interface StoryboardOption {
  title: string;
  content: string;
}

interface StoryboardOptions {
  options: StoryboardOption[];
}


export default function StorylinePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { initializeFromLLM, setOriginalPrompt } = useStoryboardStore()
  const [projectContent, setProjectContent] = useState("")
  const [projectTitle, setProjectTitle] = useState("")
  const [selectedStoryline, setSelectedStoryline] = useState(0)
  const [storylines, setStorylines] = useState<StoryboardOption[]>([])
  const [editingLeft, setEditingLeft] = useState(false)
  const [editingRight, setEditingRight] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [originalConcept, setOriginalConcept] = useState("")

  useEffect(() => {
    // Get the original concept from localStorage
    if (typeof window !== 'undefined') {
      const concept = localStorage.getItem('storyboard_original_concept')
      if (concept) {
        setOriginalConcept(concept)
        setOriginalPrompt(concept)
      }
    }

    const optionsParam = searchParams.get('options')
    if (optionsParam) {
      try {
        const decodedOptions = decodeURIComponent(optionsParam)
        const storyboardOptions: StoryboardOptions = JSON.parse(decodedOptions)
        const options = storyboardOptions.options
        setStorylines(options)
        if (options.length > 0) {
          setProjectTitle(options[0].title)
          setProjectContent(options[0].content)
        }
      } catch (error) {
        console.error('Failed to parse storyboard options:', error)
        // Fallback to default storylines if parsing fails
        setStorylines([
          {
            title: "Project Title",
            content: "Organizations are the top level entities that are used to group your applications and manage organization specific resource (e.g., databases, cache, queues)",
          },
          {
            title: "Alternative Storyline title 1",
            content: "Organizations are the top level entities that are used to group your applications and manage organization specific resource (e.g., databases, cache, queues)",
          },
        ])
        setProjectTitle("Project Title")
        setProjectContent("Organizations are the top level entities that are used to group your applications and manage organization specific resource (e.g., databases, cache, queues)")
      }
    } else {
      // Fallback if no options provided
      setStorylines([
        {
          title: "Project Title",
          content: "Organizations are the top level entities that are used to group your applications and manage organization specific resource (e.g., databases, cache, queues)",
        },
        {
          title: "Alternative Storyline title 1",
          content: "Organizations are the top level entities that are used to group your applications and manage organization specific resource (e.g., databases, cache, queues)",
        },
      ])
      setProjectTitle("Project Title")
      setProjectContent("Organizations are the top level entities that are used to group your applications and manage organization specific resource (e.g., databases, cache, queues)")
    }
  }, [searchParams])

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  const handleLeftTitleEdit = () => {
    setEditingLeft(!editingLeft)
  }

  const handleLeftTitleSave = () => {
    if (projectTitle.trim()) {
      const updatedStorylines = [...storylines]
      updatedStorylines[0] = { ...updatedStorylines[0], title: projectTitle }
      setStorylines(updatedStorylines)
      setEditingLeft(false)
    }
  }

  const handleLeftTitleCancel = () => {
    setProjectTitle(storylines[0]?.title || "Project Title")
    setEditingLeft(false)
  }

  const handleRightOptionEdit = (index: number) => {
    setSelectedStoryline(index)
    setEditingRight(!editingRight)
  }

  const handleRightOptionSave = () => {
    const updatedStorylines = [...storylines]
    // Update the content of the currently selected storyline
    if (updatedStorylines[selectedStoryline]) {
      updatedStorylines[selectedStoryline] = {
        ...updatedStorylines[selectedStoryline],
        content: projectContent
      }
      setStorylines(updatedStorylines)
    }
    setEditingRight(false)
  }

  const handleRightOptionCancel = () => {
    if (storylines[selectedStoryline]) {
      setProjectContent(storylines[selectedStoryline].content)
    }
    setEditingRight(false)
  }

  const handleStorylineSelect = (index: number) => {
    setSelectedStoryline(index)
    setProjectContent(storylines[index]?.content || "")
    setEditingRight(false)
    setEditingLeft(false)
  }

  const handleGenerateStoryboard = async () => {
    if (!projectContent.trim() || !projectTitle.trim()) {
      console.error('Project content and title are required');
      return;
    }

    setIsGenerating(true);
    try {
      // Step 1: Create a storyboard in the backend
      // - initial_line: Original concept from the concept page
      // - storyline: The expanded storyline content (generated and possibly edited)
      // - title: The project title
      const storyboard = await createStoryboard(
        originalConcept || projectContent, 
        projectTitle,
        projectContent // This is the expanded storyline
      );
      
      // Step 2: Generate scenes from the LLM using the selected/edited storyline
      const llmData = await generateStoryboardScenes(projectContent);
      
      // Step 3: Initialize the storyboard with LLM data
      await initializeFromLLM(storyboard.id, llmData);
      
      // Navigate to the editor page
      router.push('/storyboard/new/editor');
    } catch (error) {
      console.error('Failed to generate storyboard:', error);
      // You might want to show an error toast here
    } finally {
      setIsGenerating(false);
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
          <Link href="/storyboard/new/concept" className="flex items-center gap-2 text-white hover:text-neutral-300">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Project Title...</span>
          </Link>
          <div className="flex items-center gap-2 ml-auto text-sm">
            <Link href="/storyboard/new/concept" className="text-neutral-400 hover:text-white">Concept</Link>
            <span className="text-neutral-400">&gt;</span>
            <span className="text-white">Storyline</span>
            <span className="text-neutral-600">&gt;</span>
            <Link href="/storyboard/new/editor" className="text-neutral-600 hover:text-neutral-400">Breakdown</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Project Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              {editingLeft ? (
                <>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="text-2xl font-semibold bg-neutral-900 border border-neutral-800 text-white"
                    placeholder="Project Title"
                  />
                  <Button
                    size="sm"
                    onClick={handleLeftTitleSave}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLeftTitleCancel}
                    className="border-neutral-700 hover:bg-neutral-800 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold">{projectTitle}</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLeftTitleEdit}
                    className="text-neutral-400 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
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
              {storylines.slice(0, 2).map((storyline, index) => (
                <Card
                  key={index}
                  onClick={() => handleStorylineSelect(index)}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedStoryline === index
                      ? "bg-neutral-900 border-2 border-blue-500"
                      : "bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{storyline.title}</h3>
                    {selectedStoryline === index && (
                      <>
                        {editingRight ? (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRightOptionSave()
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRightOptionCancel()
                              }}
                              className="border-neutral-700 hover:bg-neutral-800 text-white"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRightOptionEdit(index)
                            }}
                            className="text-neutral-400 hover:text-white"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {truncateText(storyline.content, 200)}
                  </p>
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
          <Button 
            onClick={handleGenerateStoryboard} 
            disabled={isGenerating || !projectContent.trim() || !projectTitle.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Storyboard
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
