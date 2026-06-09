'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredTokens } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const { accessToken } = getStoredTokens()
    if (accessToken) router.replace('/dashboard')
    else router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
