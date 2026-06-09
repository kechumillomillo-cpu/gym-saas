'use client'
import { useState, useEffect, useCallback } from 'react'
import { authApi } from '@/lib/api'
import { storeTokens, clearTokens, getUser, storeUser, getStoredTokens } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const { accessToken } = getStoredTokens()
    if (!accessToken) { setLoading(false); return }
    try {
      const { data } = await authApi.me()
      setUser(data)
      storeUser(data)
    } catch {
      clearTokens()
      setUser(null)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const cached = getUser()
    if (cached) setUser(cached)
    loadUser()

    const handleLogout = () => { setUser(null) }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [loadUser])

  const login = async (email: string, password: string, gymSlug?: string) => {
    const { data } = await authApi.login({ email, password, gymSlug })
    storeTokens(data.accessToken, data.refreshToken)
    if (gymSlug) localStorage.setItem('gymSlug', gymSlug)
    storeUser(data.user)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    const { refreshToken } = getStoredTokens()
    try { await authApi.logout(refreshToken || undefined) } catch {}
    clearTokens()
    setUser(null)
  }

  return { user, loading, login, logout, isAuthenticated: !!user }
}
