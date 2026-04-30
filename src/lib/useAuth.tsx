'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  authModalOpen: boolean
  authModalTab: 'login' | 'register' | 'forgot'
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void
  closeAuthModal: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login')

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // First try to find by auth_id (Supabase Auth UUID)
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
        .single()

      if (data) {
        setUser(data as User)
        return
      }
    } catch (e) {
      // Column might not exist yet, continue to fallback
    }

    // Fallback: try to find by email
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.email) {
      try {
        const { data: userByEmail } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single()
        if (userByEmail) {
          setUser(userByEmail as User)
          return
        }
      } catch (e) {
        // Email column might not exist either
      }
    }

    // Last fallback: use old ID derivation logic
    const derivedId = parseInt(userId.replace(/-/g, '').substring(0, 8), 16)
    try {
      const { data: userById } = await supabase
        .from('users')
        .select('*')
        .eq('id', derivedId)
        .single()
      if (userById) {
        setUser(userById as User)
        return
      }
    } catch (e) {
      // User not found by derived ID
    }

    // If no user found in database but we have a valid auth session,
    // create a temporary user object from auth metadata
    if (session?.user) {
      const tempUser: User = {
        id: derivedId,
        username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '用户',
        avatar_url: session.user.user_metadata?.avatar_url || null,
        user_level: '普通用户',
        created_at: session.user.created_at,
        last_login_at: new Date().toISOString(),
        comment_count: 0,
        total_views: 0,
      }
      setUser(tempUser)
    } else {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserProfile])

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
  }, [])

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserProfile(session.user.id)
    } else {
      setUser(null)
    }
  }, [fetchUserProfile])

  return (
    <AuthContext.Provider value={{ user, loading, authModalOpen, authModalTab, openAuthModal, closeAuthModal, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
