"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function AuthGuard({
  children,
  redirectTo = '/landing',
  requireAuth = true
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
      }
    }
  }, [mounted, isLoading, isAuthenticated, router, requireAuth, redirectTo])

  // Show loading state during SSR and initial hydration
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  // If auth is required but user is not authenticated, return null (will redirect)
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If auth is not required or user is authenticated, render children
  return <>{children}</>
}
