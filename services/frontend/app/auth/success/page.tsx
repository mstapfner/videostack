"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export default function AuthSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkAuth } = useAuth()

  useEffect(() => {
    const handleAuth = async () => {
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const userId = searchParams.get('user_id')

      if (accessToken && refreshToken && userId) {
        // Store tokens in localStorage
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user_id', userId)

        // Trigger auth context to reload
        await checkAuth()

        // Redirect to main app
        router.push('/app')
      } else {
        // If tokens are missing, redirect to landing
        router.push('/landing')
      }
    }

    handleAuth()
  }, [searchParams, router, checkAuth])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-white mx-auto" />
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  )
}

