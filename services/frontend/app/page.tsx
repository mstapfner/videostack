"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading) {
      if (isAuthenticated) {
        router.push('/app')
      } else {
        router.push('/landing')
      }
    }
  }, [mounted, isLoading, isAuthenticated, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
    </div>
  )
}
