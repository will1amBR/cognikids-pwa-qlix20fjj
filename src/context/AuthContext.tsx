import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import type { RecordAuthResponse, RecordModel } from 'pocketbase'

export interface AuthContextType {
  user: RecordModel | null
  token: string | null
  isValid: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<RecordAuthResponse<RecordModel>>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record)
  const [token, setToken] = useState<string | null>(pb.authStore.token)
  const [isValid, setIsValid] = useState<boolean>(pb.authStore.isValid)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Sync initial state
    setUser(pb.authStore.record)
    setToken(pb.authStore.token)
    setIsValid(pb.authStore.isValid)
    setIsLoading(false)

    // Subscribe to auth state changes
    const unsubscribe = pb.authStore.onChange((newToken, newModel) => {
      setUser(newModel)
      setToken(newToken)
      setIsValid(pb.authStore.isValid)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, pass: string) => {
    const authData = await pb.collection('users').authWithPassword(email, pass)
    setUser(authData.record)
    setToken(authData.token)
    setIsValid(true)
    return authData
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
    setIsValid(false)
  }

  const refreshUser = async () => {
    if (pb.authStore.isValid) {
      try {
        const authData = await pb.collection('users').authRefresh()
        setUser(authData.record)
      } catch (_) {
        logout()
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isValid, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
