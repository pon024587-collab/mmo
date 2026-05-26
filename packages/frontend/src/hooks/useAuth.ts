import { useState, useCallback } from 'react'

const TOKEN_KEY = 'medieval_token'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  const saveToken = useCallback((t: string) => {
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  return { token, saveToken, logout }
}
