'use client'

export function getStoredTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null }
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }
}

export function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('gymSlug')
  localStorage.removeItem('user')
}

export function getUser() {
  if (typeof window === 'undefined') return null
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

export function storeUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user))
}
