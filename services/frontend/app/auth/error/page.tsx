"use client"

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An error occurred during authentication'

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="max-w-md w-full p-6 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-500/10 p-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Authentication Failed</h1>
          <p className="text-neutral-400">{message}</p>
        </div>

        <div className="pt-4">
          <Link href="/landing">
            <Button className="bg-white text-black hover:bg-neutral-200">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

