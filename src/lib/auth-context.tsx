"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id?: string
  user_id?: string
  email?: string
  name: string
  nickname?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (userData: User) => {
    // API에서 받은 사용자 데이터를 저장
    const user: User = {
      id: userData.user_id || userData.id,
      user_id: userData.user_id,
      email: userData.user_id || userData.email,
      name: userData.name,
      nickname: userData.nickname,
      role: userData.role || "user",
    }
    localStorage.setItem("user", JSON.stringify(user))
    setUser(user)
  }

  const signup = async (email: string, password: string, name: string) => {
    // Mock signup - replace with actual API call
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: "user",
    }
    localStorage.setItem("user", JSON.stringify(mockUser))
    setUser(mockUser)
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
