"use client"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Mic, ImageIcon, Undo2, Star, Clock, Music, Settings, Camera, User, Loader2, Upload, X, Monitor } from "lucide-react"
import { useState, useRef } from "react"
import Image from "next/image"
import { createImageGeneration, createVideoGeneration, createAudioGeneration } from "@/lib/api-client"
import { AuthGuard } from "@/components/AuthGuard"

const angleOptions = [
  { id: "none", label: "None", image: null },
  { id: "eye-level", label: "Eye Level", image: "/woman-portrait-eye-level.jpg" },
  { id: "low-angle", label: "Low angle", image: "/woman-in-jacket-low-angle.jpg" },
  { id: "over-shoulder", label: "Over the shoulder", image: "/person-with-camera-over-shoulder.jpg" },
  { id: "overhead", label: "Overhead", image: "/person-from-above-overhead.jpg" },
  { id: "birds-eye", label: "Bird's eye view", image: "/person-with-camera-birds-eye-view.jpg" },
]

const videoModelOptions = [
  { id: "seedance-lite-text", label: "Seedance-Lite Text-to-video", uploadButtons: 0 },
  { id: "seedance-pro-text", label: "Seedance-Pro Text-to-video", uploadButtons: 0 },
  { id: "seedance-lite-image", label: "Seedance-Lite Image-to-video", uploadButtons: 1 },
  { id: "seedance-lite-frames", label: "Seedance-Lite First & Last frame", uploadButtons: 2 },
]

const aspectRatioOptions = [
  { id: "16:9", label: "16:9" },
  { id: "4:3", label: "4:3" },
  { id: "1:1", label: "1:1" },
  { id: "3:4", label: "3:4" },
  { id: "9:16", label: "9:16" },
  { id: "21:9", label: "21:9" },
  { id: "adaptive", label: "Adaptive" },
]

const durationOptions = [
  { id: "3s", label: "3s" },
  { id: "4s", label: "4s" },
  { id: "5s", label: "5s" },
  { id: "6s", label: "6s" },
  { id: "7s", label: "7s" },
  { id: "8s", label: "8s" },
  { id: "9s", label: "9s" },
  { id: "10s", label: "10s" },
  { id: "11s", label: "11s" },
  { id: "12s", label: "12s" },
]

const imageModelOptions = [
  { id: "seedream", label: "Seedream", hasResolutions: true },
  { id: "nanobanana", label: "NanoBanana", hasResolutions: false },
]

const seedreamResolutions = [
  { id: "2048x2048", label: "2048x2048" },
  { id: "2304x1728", label: "2304x1728" },
  { id: "1728x2304", label: "1728x2304" },
  { id: "2560x1440", label: "2560x1440" },
  { id: "1440x2560", label: "1440x2560" },
  { id: "2496x1664", label: "2496x1664" },
  { id: "1664x2496", label: "1664x2496" },
  { id: "3024x1296", label: "3024x1296" },
]

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState("video")
  const [selectedAngle, setSelectedAngle] = useState("none")
  const [prompt, setPrompt] = useState("")
  const [videoPrompt, setVideoPrompt] = useState("")
  const [audioPrompt, setAudioPrompt] = useState("")
  const [audioDuration, setAudioDuration] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [selectedImage1, setSelectedImage1] = useState<File | null>(null)
  const [selectedImage2, setSelectedImage2] = useState<File | null>(null)
  const [image1Preview, setImage1Preview] = useState<string | null>(null)
  const [image2Preview, setImage2Preview] = useState<string | null>(null)
  const [selectedVideoModel, setSelectedVideoModel] = useState("seedance-lite-text")
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9")
  const [selectedDuration, setSelectedDuration] = useState("5s")
  const [selectedImageModel, setSelectedImageModel] = useState("seedream")
  const [selectedImageResolution, setSelectedImageResolution] = useState("2048x2048")
  const [nanoBananaImage, setNanoBananaImage] = useState<File | null>(null)
  const [nanoBananaImagePreview, setNanoBananaImagePreview] = useState<string | null>(null)

  const fileInput1Ref = useRef<HTMLInputElement>(null)
  const fileInput2Ref = useRef<HTMLInputElement>(null)
  const nanoBananaFileInputRef = useRef<HTMLInputElement>(null)


  const getCurrentVideoModel = () => {
    return videoModelOptions.find(model => model.id === selectedVideoModel) || videoModelOptions[0]
  }

  const getCurrentImageModel = () => {
    return imageModelOptions.find(model => model.id === selectedImageModel) || imageModelOptions[0]
  }

  const handleVideoModelChange = (modelId: string) => {
    setSelectedVideoModel(modelId)
    // Reset selected images when model changes
    setSelectedImage1(null)
    setSelectedImage2(null)
    setImage1Preview(null)
    setImage2Preview(null)
  }

  const handleImageModelChange = (modelId: string) => {
    setSelectedImageModel(modelId)
    // Reset resolution to default when switching to NanoBanana (which has fixed 1:1)
    if (modelId === "nanobanana") {
      setSelectedImageResolution("1:1")
    } else {
      setSelectedImageResolution("2048x2048")
      // Clear NanoBanana image when switching to Seedream
      setNanoBananaImage(null)
      setNanoBananaImagePreview(null)
      if (nanoBananaFileInputRef.current) {
        nanoBananaFileInputRef.current.value = ''
      }
    }
  }

  const handleFileSelect = (fileNumber: 1 | 2, file: File | null) => {
    if (fileNumber === 1) {
      setSelectedImage1(file)
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => setImage1Preview(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setImage1Preview(null)
      }
    } else {
      setSelectedImage2(file)
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => setImage2Preview(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setImage2Preview(null)
      }
    }
  }

  const handleUploadClick = (fileNumber: 1 | 2) => {
    if (fileNumber === 1) {
      fileInput1Ref.current?.click()
    } else {
      fileInput2Ref.current?.click()
    }
  }

  const handleRemoveImage = (fileNumber: 1 | 2) => {
    if (fileNumber === 1) {
      setSelectedImage1(null)
      setImage1Preview(null)
      if (fileInput1Ref.current) {
        fileInput1Ref.current.value = ''
      }
    } else {
      setSelectedImage2(null)
      setImage2Preview(null)
      if (fileInput2Ref.current) {
        fileInput2Ref.current.value = ''
      }
    }
  }

  const handleNanoBananaFileSelect = (file: File | null) => {
    setNanoBananaImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setNanoBananaImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setNanoBananaImagePreview(null)
    }
  }

  const handleNanoBananaUploadClick = () => {
    nanoBananaFileInputRef.current?.click()
  }

  const handleRemoveNanoBananaImage = () => {
    setNanoBananaImage(null)
    setNanoBananaImagePreview(null)
    if (nanoBananaFileInputRef.current) {
      nanoBananaFileInputRef.current.value = ''
    }
  }

  const handleImageGeneration = async () => {
    if (!prompt.trim()) {
      setGenerationError("Please enter a prompt for image generation")
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setGeneratedImageUrl(null)

    try {
      const response = await createImageGeneration(prompt, selectedImageModel)
      console.log('Generation completed successfully:', response)

      // Set the generated image URL directly from the response
      if (response.generated_content_url) {
        setGeneratedImageUrl(response.generated_content_url)
        console.log('Image URL received:', response.generated_content_url)
      } else {
        setGenerationError('Generation completed but no image URL was returned')
      }

      setIsGenerating(false)
    } catch (error) {
      console.error('Error creating image generation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image'
      setGenerationError(errorMessage)
      setIsGenerating(false)
    }
  }

  const handleVideoGeneration = async () => {
    if (!videoPrompt.trim()) {
      setGenerationError("Please enter a prompt for video generation")
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setGeneratedVideoUrl(null)

    try {
      const response = await createVideoGeneration(videoPrompt, selectedVideoModel, image1Preview || undefined, image2Preview || undefined)
      console.log('Video generation completed successfully:', response)

      // Set the generated video URL directly from the response
      if (response.generated_content_url) {
        setGeneratedVideoUrl(response.generated_content_url)
        console.log('Video URL received:', response.generated_content_url)
      } else {
        setGenerationError('Generation completed but no video URL was returned')
      }

      setIsGenerating(false)
    } catch (error) {
      console.error('Error creating video generation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate video'
      setGenerationError(errorMessage)
      setIsGenerating(false)
    }
  }

  const handleAudioGeneration = async () => {
    if (!audioPrompt.trim()) {
      setGenerationError("Please enter a prompt for audio generation")
      return
    }

    // Validate duration
    if (audioDuration < 10 || audioDuration > 300) {
      setGenerationError("Duration must be between 10 and 300 seconds")
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setGeneratedAudioUrl(null)

    try {
      const response = await createAudioGeneration(audioPrompt, audioDuration)
      console.log('Audio generation completed successfully:', response)

      // Set the generated audio URL directly from the response
      if (response.generated_content_url) {
        setGeneratedAudioUrl(response.generated_content_url)
        console.log('Audio URL received:', response.generated_content_url)
      } else {
        setGenerationError('Generation completed but no audio URL was returned')
      }

      setIsGenerating(false)
    } catch (error) {
      console.error('Error creating audio generation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio'
      setGenerationError(errorMessage)
      setIsGenerating(false)
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="flex-1">
        <header className="flex items-center justify-end gap-3 p-6 border-b border-neutral-800">
          <Button className="bg-transparent border border-neutral-700 hover:bg-neutral-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Start New Project
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder-user.jpg" />
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
                  {generatedVideoUrl && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Generated Video</h3>
                      <div className="relative w-full max-w-2xl mx-auto">
                        <video
                          src={generatedVideoUrl}
                          controls
                          className="w-full h-auto rounded-lg border border-neutral-700"
                          onError={() => setGenerationError("Failed to load generated video")}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  {/* Selected Images Preview */}
                  {(image1Preview || image2Preview) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Selected Images</h3>
                      <div className="flex gap-4 justify-center">
                        {image1Preview && (
                          <div className="relative">
                            <Image
                              src={image1Preview}
                              alt="Selected image 1"
                              width={200}
                              height={200}
                              className="w-32 h-32 object-cover rounded-lg border border-neutral-700"
                            />
                            <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              {getCurrentVideoModel().uploadButtons === 2 ? "First Frame" : "Image"}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-0"
                              onClick={() => handleRemoveImage(1)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        {image2Preview && (
                          <div className="relative">
                            <Image
                              src={image2Preview}
                              alt="Selected image 2"
                              width={200}
                              height={200}
                              className="w-32 h-32 object-cover rounded-lg border border-neutral-700"
                            />
                            <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Last Frame
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-0"
                              onClick={() => handleRemoveImage(2)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <Textarea
                      placeholder="Describe what you want to create..."
                      className="min-h-[140px] bg-neutral-950 border-blue-500 text-white placeholder:text-neutral-500 resize-none pr-12"
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
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

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {/* Hidden file inputs */}
                      <input
                        ref={fileInput1Ref}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          handleFileSelect(1, file)
                        }}
                      />
                      <input
                        ref={fileInput2Ref}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          handleFileSelect(2, file)
                        }}
                      />
                      
                      {/* Dynamic Upload buttons based on selected model */}
                      {getCurrentVideoModel().uploadButtons >= 1 && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800 relative"
                          onClick={() => handleUploadClick(1)}
                        >
                          {image1Preview ? (
                            <Image
                              src={image1Preview}
                              alt="Selected image 1"
                              width={20}
                              height={20}
                              className="w-5 h-5 object-cover rounded"
                            />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </Button>
                      )}
                      
                      {getCurrentVideoModel().uploadButtons >= 2 && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800 relative"
                          onClick={() => handleUploadClick(2)}
                        >
                          {image2Preview ? (
                            <Image
                              src={image2Preview}
                              alt="Selected image 2"
                              width={20}
                              height={20}
                              className="w-5 h-5 object-cover rounded"
                            />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Select value={selectedVideoModel} onValueChange={handleVideoModelChange}>
                        <SelectTrigger className="w-64 bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                          <Star className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800">
                          {videoModelOptions.map((model) => (
                            <SelectItem key={model.id} value={model.id} className="text-white hover:bg-neutral-800">
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
                        <SelectTrigger className="w-28 bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                          <Monitor className="w-4 h-4 mr-1" />
                          <SelectValue placeholder={selectedAspectRatio} />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800">
                          {aspectRatioOptions.map((ratio) => (
                            <SelectItem key={ratio.id} value={ratio.id} className="text-white hover:bg-neutral-800">
                              {ratio.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger className="w-28 bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                          <Clock className="w-4 h-4 mr-1" />
                          <SelectValue placeholder={selectedDuration} />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800">
                          {durationOptions.map((duration) => (
                            <SelectItem key={duration.id} value={duration.id} className="text-white hover:bg-neutral-800">
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
                    onClick={handleVideoGeneration}
                    disabled={isGenerating || !videoPrompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Video...
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
                        Generate Video
                      </>
                    )}
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="image" className="mt-8">
                <Card className="bg-neutral-900 border-neutral-800 p-8 space-y-6">
                  {generatedImageUrl && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Generated Image</h3>
                      <div className="relative w-full max-w-2xl mx-auto">
                        <Image
                          src={generatedImageUrl}
                          alt="Generated image"
                          width={1024}
                          height={1024}
                          className="w-full h-auto rounded-lg border border-neutral-700"
                          onError={() => setGenerationError("Failed to load generated image")}
                        />
                      </div>
                    </div>
                  )}

                  {/* Selected Image Preview for NanoBanana */}
                  {nanoBananaImagePreview && selectedImageModel === "nanobanana" && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Selected Image</h3>
                      <div className="flex justify-center">
                        <div className="relative">
                          <Image
                            src={nanoBananaImagePreview}
                            alt="Selected image for processing"
                            width={200}
                            height={200}
                            className="w-32 h-32 object-cover rounded-lg border border-neutral-700"
                          />
                          <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Source Image
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-0"
                            onClick={handleRemoveNanoBananaImage}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

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

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {/* Left side intentionally empty - removed image buttons */}
                    </div>

                    <div className="flex gap-2">
                      <Select value={selectedImageModel} onValueChange={handleImageModelChange}>
                        <SelectTrigger className="w-40 bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                          <Star className="w-4 h-4 mr-2" />
                          <SelectValue placeholder={selectedImageModel} />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800">
                          {imageModelOptions.map((model) => (
                            <SelectItem key={model.id} value={model.id} className="text-white hover:bg-neutral-800">
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getCurrentImageModel().hasResolutions && (
                        <Select value={selectedImageResolution} onValueChange={setSelectedImageResolution}>
                          <SelectTrigger className="w-32 bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                            <Monitor className="w-4 h-4 mr-1" />
                            <SelectValue placeholder={selectedImageResolution} />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900 border-neutral-800">
                            {seedreamResolutions.map((resolution) => (
                              <SelectItem key={resolution.id} value={resolution.id} className="text-white hover:bg-neutral-800">
                                {resolution.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        )}
                        {!getCurrentImageModel().hasResolutions && (
                          <div className="flex items-center px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-md text-sm text-neutral-400">
                            <Monitor className="w-4 h-4 mr-1" />
                            1:1 Fixed
                          </div>
                        )}
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      {/* NanoBanana upload button - positioned at the right */}
                      {!getCurrentImageModel().hasResolutions && (
                        <>
                          {/* Hidden file input for NanoBanana */}
                          <input
                            ref={nanoBananaFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              handleNanoBananaFileSelect(file)
                            }}
                          />
                          {/* Upload button for NanoBanana */}
                          <Button
                            size="icon"
                            variant="outline"
                            className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800 relative"
                            onClick={handleNanoBananaUploadClick}
                          >
                            {nanoBananaImagePreview ? (
                              <Image
                                src={nanoBananaImagePreview}
                                alt="Selected NanoBanana image"
                                width={20}
                                height={20}
                                className="w-5 h-5 object-cover rounded"
                              />
                            ) : (
                              <Upload className="w-5 h-5" />
                            )}
                          </Button>
                        </>
                      )}
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
                </Card>
              </TabsContent>

              <TabsContent value="audio" className="mt-8">
                <Card className="bg-neutral-900 border-neutral-800 p-8 space-y-6">
                  {generatedAudioUrl && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Generated Audio</h3>
                      <div className="relative w-full max-w-2xl mx-auto">
                        <audio
                          src={generatedAudioUrl}
                          controls
                          className="w-full rounded-lg border border-neutral-700"
                          onError={() => setGenerationError("Failed to load generated audio")}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <Textarea
                      placeholder="Describe what you want to create..."
                      className="min-h-[140px] bg-neutral-950 border-blue-500 text-white placeholder:text-neutral-500 resize-none pr-12"
                      value={audioPrompt}
                      onChange={(e) => setAudioPrompt(e.target.value)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute bottom-3 right-3 text-neutral-400 hover:text-white"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audio-duration" className="text-sm font-medium text-neutral-300">
                      Duration (seconds)
                    </Label>
                    <Input
                      id="audio-duration"
                      type="number"
                      min={10}
                      max={300}
                      value={audioDuration}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 10
                        setAudioDuration(Math.min(300, Math.max(10, value)))
                      }}
                      className="bg-neutral-950 border-neutral-700 text-white"
                      placeholder="Enter duration (10-300 seconds)"
                    />
                    <p className="text-xs text-neutral-500">
                      Enter a value between 10 and 300 seconds
                    </p>
                  </div>

                  {generationError && (
                    <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                      {generationError}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                        <Star className="w-4 h-4 mr-2" />
                        ElevenLabs
                      </Button>
                      <Button variant="outline" className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                        <Clock className="w-4 h-4 mr-2" />
                        {audioDuration}s
                      </Button>
                      <Button variant="outline" className="bg-neutral-950 border-neutral-700 hover:bg-neutral-800">
                        <Music className="w-4 h-4 mr-2" />
                        MP3
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
                    onClick={handleAudioGeneration}
                    disabled={isGenerating || !audioPrompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Audio...
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
                        Generate Audio
                      </>
                    )}
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
