import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  total_hours: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  expected_hours: number
  location: string
  date: string
  thumbnail_url?: string
  status: 'pending' | 'approved' | 'rejected'
  created_by: string
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

export interface ProjectEditRequest {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string
  expected_hours: number
  location: string
  date: string
  thumbnail_url?: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  projects?: {
    title: string
    created_by: string
  }
  profiles?: {
    full_name: string
    email: string
  }
  reviewer?: {
    full_name: string
    email: string
  }
}

export interface ProjectSignup {
  id: string
  project_id: string
  user_id: string
  created_at: string
}

export interface HourSubmission {
  id: string
  project_id: string
  user_id: string
  hours_completed: number
  description: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  projects?: {
    title: string
  }
  profiles?: {
    full_name: string
    email: string
  }
}

export const hasAdminUsers = async (): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)

  if (error) {
    console.error('Error checking admin users:', error)
    return false
  }

  return (data?.length || 0) > 0
}

export const getAllUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all users:', error)
    throw error
  }

  return data || []
}

export const promoteToAdmin = async (userId: string): Promise<void> => {
  const { error } = await supabase.rpc('promote_to_admin', {
    user_id: userId
  })

  if (error) {
    console.error('Error promoting to admin:', error)
    throw error
  }
}

export const uploadProjectThumbnail = async (file: File, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('project-thumbnails')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('project-thumbnails')
    .getPublicUrl(data.path)

  return publicUrl
}

export const deleteProjectThumbnail = async (url: string): Promise<void> => {
  if (!url) return

  // Extract the file path from the URL
  const urlParts = url.split('/project-thumbnails/')
  if (urlParts.length < 2) return

  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from('project-thumbnails')
    .remove([filePath])

  if (error) {
    console.error('Error deleting thumbnail:', error)
  }
}

export const createEditRequest = async (
  projectId: string,
  editData: {
    title: string
    description: string
    expected_hours: number
    location: string
    date: string
    thumbnail_url?: string
  }
): Promise<void> => {
  const { error } = await supabase
    .from('project_edit_requests')
    .insert({
      project_id: projectId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      ...editData
    })

  if (error) throw error
}

export const getPendingEditRequests = async (): Promise<ProjectEditRequest[]> => {
  const { data, error } = await supabase
    .from('project_edit_requests')
    .select(`
      *,
      projects (
        title,
        created_by
      ),
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getUserEditRequests = async (userId: string): Promise<ProjectEditRequest[]> => {
  const { data, error } = await supabase
    .from('project_edit_requests')
    .select(`
      *,
      projects (
        title
      ),
      reviewer:reviewed_by (
        full_name,
        email
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const approveEditRequest = async (
  requestId: string,
  adminId: string
): Promise<void> => {
  // Get the edit request details
  const { data: editRequest, error: fetchError } = await supabase
    .from('project_edit_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError) throw fetchError

  // Update the original project with the new data
  const { error: updateError } = await supabase
    .from('projects')
    .update({
      title: editRequest.title,
      description: editRequest.description,
      expected_hours: editRequest.expected_hours,
      location: editRequest.location,
      date: editRequest.date,
      thumbnail_url: editRequest.thumbnail_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', editRequest.project_id)

  if (updateError) throw updateError

  // Mark the edit request as approved
  const { error: approveError } = await supabase
    .from('project_edit_requests')
    .update({
      status: 'approved',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId)

  if (approveError) throw approveError
}

export const rejectEditRequest = async (
  requestId: string,
  adminId: string,
  adminNotes?: string
): Promise<void> => {
  const { error } = await supabase
    .from('project_edit_requests')
    .update({
      status: 'rejected',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes
    })
    .eq('id', requestId)

  if (error) throw error
}
