"use client"

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { login, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated) {
      router.push('/app')
    }
  }, [mounted, isLoading, isAuthenticated, router])

  // Show consistent loading state during SSR and initial hydration
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Welcome to Video Stack.AI
          </h1>
          <p className="text-xl text-neutral-400">
            AI-powered video creation platform
          </p>
        </div>

        <div className="pt-8">
          <Button
            onClick={login}
            size="lg"
            className="bg-white text-black hover:bg-neutral-200 px-8 py-6 text-lg font-semibold"
          >
            Sign In to Continue
          </Button>
        </div>

        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
              <p className="text-sm text-neutral-400">
                Create stunning videos with the power of AI
              </p>
            </div>
            <div className="p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <h3 className="font-semibold text-lg mb-2">Easy to Use</h3>
              <p className="text-sm text-neutral-400">
                Intuitive interface designed for creators
              </p>
            </div>
            <div className="p-6 rounded-lg border border-neutral-800 bg-neutral-900/50">
              <h3 className="font-semibold text-lg mb-2">Professional Results</h3>
              <p className="text-sm text-neutral-400">
                Export high-quality videos in minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

