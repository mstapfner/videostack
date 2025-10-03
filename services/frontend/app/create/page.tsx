"use client"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Mic, ImageIcon, Undo2, Star, Clock, Music, Settings, Camera, User, Loader2 } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { createImageGeneration, getGenerationStatus, GenerationResponse } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

const angleOptions = [
  { id: "none", label: "None", image: null },
  { id: "eye-level", label: "Eye Level", image: "/woman-portrait-eye-level.jpg" },
  { id: "low-angle", label: "Low angle", image: "/woman-in-jacket-low-angle.jpg" },
  { id: "over-shoulder", label: "Over the shoulder", image: "/person-with-camera-over-shoulder.jpg" },
  { id: "overhead", label: "Overhead", image: "/person-from-above-overhead.jpg" },
  { id: "birds-eye", label: "Bird's eye view", image: "/person-with-camera-birds-eye-view.jpg" },
]

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState("video")
  const [selectedAngle, setSelectedAngle] = useState("none")
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [currentGeneration, setCurrentGeneration] = useState<GenerationResponse | null>(null)

  const { isAuthenticated } = useAuth()

  const handleImageGeneration = async () => {
    if (!prompt.trim()) {
      setGenerationError("Please enter a prompt for image generation")
      return
    }

    // Check authentication more thoroughly
    const token = localStorage.getItem('access_token')
    if (!token || !isAuthenticated) {
      setGenerationError("Please log in to generate images")
      return
    }

    console.log('Starting image generation with authentication check:', {
      hasToken: !!token,
      isAuthenticated,
      promptLength: prompt.length
    })

    setIsGenerating(true)
    setGenerationError(null)
    setGeneratedImageUrl(null)

    try {
      const response = await createImageGeneration(prompt)
      setCurrentGeneration(response)
      console.log('Generation created successfully:', response.id)

      // Poll for status updates using the API function
      const pollInterval = setInterval(async () => {
        try {
          const statusData = await getGenerationStatus(response.id)
          setCurrentGeneration(statusData)
          console.log('Generation status update:', statusData.status)

          if (statusData.status === 'completed' && statusData.generated_content_url) {
            setGeneratedImageUrl(statusData.generated_content_url)
            console.log('Generation completed with image URL:', statusData.generated_content_url)
            clearInterval(pollInterval)
            setIsGenerating(false)
          } else if (statusData.status === 'failed') {
            const errorMsg = statusData.error_message || 'Image generation failed'
            console.error('Generation failed:', errorMsg)
            setGenerationError(errorMsg)
            clearInterval(pollInterval)
            setIsGenerating(false)
          }
        } catch (error) {
          console.error('Error checking generation status:', error)
          // If it's an authentication error, stop polling and show error
          if (error instanceof Error && error.message.includes('Authentication failed')) {
            setGenerationError('Authentication failed. Please log in again.')
            clearInterval(pollInterval)
            setIsGenerating(false)
          }
        }
      }, 2000) // Poll every 2 seconds

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        if (isGenerating) {
          console.warn('Generation timed out after 5 minutes')
          setGenerationError('Generation timeout - please try again')
          setIsGenerating(false)
        }
      }, 300000)

    } catch (error) {
      console.error('Error creating image generation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start image generation'
      setGenerationError(errorMessage)
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="flex-1">
        <header className="flex items-center justify-end gap-3 p-6 border-b border-neutral-800">
          <Button className="bg-transparent border border-neutral-700 hover:bg-neutral-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Start New Project
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src="/diverse-user-avatars.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-88px)] p-8">
          <div className="max-w-3xl w-full space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-bold text-balance">Start creating today</h1>
              <p className="text-neutral-400 text-lg">Turn your prompt into a image audio or video</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-neutral-900 border border-neutral-800">
                <TabsTrigger
                  value="video"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white"
                >
                  Video
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white"
                >
                  Image
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white"
                >
                  Audio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="mt-8">
                <Card className="bg-neutral-900 border-neutral-800 p-8 space-y-6">
                  <div className="relative">
                    <Textarea
                      placeholder="Describe what you want to create..."
                      className="min-h-[140px] bg-neutral-950 border-blue-500 text-white placeholder:text-neutral-500 resize-none pr-12"
                      defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.  we need to have the options to create images or videos or audio in this area"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute bottom-3 right-3 text-neutral-400 hover:text-white"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                      >
                        <Undo2 className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                        <Star className="w-4 h-4 mr-2" />
                        LTXV
                      </Button>
                      <Button variant="outline" className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                        <Clock className="w-4 h-4 mr-2" />
                        60 Sec
                      </Button>
                      <Button variant="outline" className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                        <Music className="w-4 h-4 mr-2" />
                        On
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 3L4 9L12 15L20 9L12 3Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 15L12 21L20 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Generate Video
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="image" className="mt-8">
                <Card className="bg-neutral-900 border-neutral-800 p-8 space-y-6">
                  <div className="relative">
                    <Textarea
                      placeholder="Describe what you want to create..."
                      className="min-h-[140px] bg-neutral-950 border-blue-500 text-white placeholder:text-neutral-500 resize-none pr-12"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute bottom-3 right-3 text-neutral-400 hover:text-white"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  </div>

                  {generationError && (
                    <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                      {generationError}
                    </div>
                  )}

                  {currentGeneration && (
                    <div className="p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg text-blue-400 text-sm">
                      Status: {currentGeneration.status}
                      {currentGeneration.error_message && (
                        <div className="mt-1 text-red-300">Error: {currentGeneration.error_message}</div>
                      )}
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm">
                      Please log in to generate images
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                        <Star className="w-4 h-4 mr-2" />
                        Flux
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                          >
                            <User className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-neutral-900 border-neutral-800 p-4" align="end">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-white">Angle</h4>
                            <div className="grid grid-cols-3 gap-3">
                              {angleOptions.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setSelectedAngle(option.id)}
                                  className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-colors ${
                                    selectedAngle === option.id
                                      ? "border-blue-500 bg-neutral-800"
                                      : "border-neutral-700 hover:border-neutral-600"
                                  }`}
                                >
                                  <div className="w-16 h-16 rounded-lg bg-neutral-800 flex items-center justify-center overflow-hidden">
                                    {option.image ? (
                                      <Image
                                        src={option.image || "/placeholder.svg"}
                                        alt={option.label}
                                        width={64}
                                        height={64}
                                        className="object-cover w-full h-full"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-full border-4 border-red-500 relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="w-full h-0.5 bg-red-500 rotate-45" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs text-neutral-300 text-center leading-tight">
                                    {option.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
                    onClick={handleImageGeneration}
                    disabled={isGenerating || !prompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 3L4 9L12 15L20 9L12 3Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4 15L12 21L20 15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Generate Image
                      </>
                    )}
                  </Button>

                  {generatedImageUrl && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4 text-center">Generated Image</h3>
                      <div className="relative w-full max-w-md mx-auto">
                        <Image
                          src={generatedImageUrl}
                          alt="Generated image"
                          width={512}
                          height={512}
                          className="w-full h-auto rounded-lg border border-neutral-700"
                          onError={() => setGenerationError("Failed to load generated image")}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="audio" className="mt-8">
                <Card className="bg-neutral-900 border-neutral-800 p-8 space-y-6">
                  <div className="relative">
                    <Textarea
                      placeholder="Describe what you want to create..."
                      className="min-h-[140px] bg-neutral-950 border-blue-500 text-white placeholder:text-neutral-500 resize-none pr-12"
                      defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.  we need to have the options to create images or videos or audio in this area"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute bottom-3 right-3 text-neutral-400 hover:text-white"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 3L4 9L12 15L20 9L12 3Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 15L12 21L20 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Generate Audio
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
