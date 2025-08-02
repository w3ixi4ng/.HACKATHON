import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Profile, hasAdminUsers, promoteToAdmin } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, makeAdmin?: boolean) => Promise<void>
  signOut: () => Promise<void>
  canBecomeAdmin: boolean
  promoteUserToAdmin: (userId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [canBecomeAdmin, setCanBecomeAdmin] = useState(false)

  useEffect(() => {
    // Check if admin users exist
    checkAdminStatus()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      setUser(session?.user ?? null)
      if (session?.user) {
        if (event === 'SIGNED_UP' || event === 'SIGNED_IN') {
          // Wait a bit for the trigger to create the profile
          setTimeout(() => fetchProfile(session.user.id), 1000)
        } else {
          await fetchProfile(session.user.id)
        }
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const hasAdmins = await hasAdminUsers()
      setCanBecomeAdmin(!hasAdmins)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setCanBecomeAdmin(false)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userData.user.email!,
              full_name: userData.user.user_metadata?.full_name || '',
              role: 'user'
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error creating profile:', insertError)
          } else {
            data = newProfile
          }
        }
      } else if (error) {
        throw error
      }


      setProfile(data)
      
      // Update admin status after profile is loaded
      await checkAdminStatus()
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string, makeAdmin: boolean = false) => {

    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    
    if (error) throw error
    
    // If user should be admin and no admins exist, promote them
    if (makeAdmin && data.user && canBecomeAdmin) {

      try {
        // Wait for profile to be created, then promote
        setTimeout(async () => {
          try {

            await promoteToAdmin(data.user!.id)

            // Refresh profile to get updated role
            await fetchProfile(data.user!.id)
          } catch (error) {
            console.error('Error promoting to admin:', error)
          }
        }, 3000) // Increased wait time
      } catch (error) {
        console.error('Error in admin promotion setup:', error)
      }
    }
    
    // If user is immediately confirmed (no email confirmation required)
    if (data.user && !data.user.email_confirmed_at) {

    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const promoteUserToAdmin = async (userId: string) => {

    try {
      await promoteToAdmin(userId)

      // Refresh current user's profile if they were promoted
      if (user?.id === userId) {
        await fetchProfile(userId)
      }
      await checkAdminStatus()
    } catch (error) {
      console.error('Error promoting user:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    canBecomeAdmin,
    promoteUserToAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
