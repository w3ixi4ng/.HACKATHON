import React, { useState, useEffect } from 'react'
import { supabase, Project, HourSubmission, ProjectEditRequest, getPendingEditRequests, approveEditRequest, rejectEditRequest } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, XCircle, Clock, Calendar, User, Edit, Shield, AlertTriangle, HandHeart, Users } from 'lucide-react'

const Admin: React.FC = () => {
  const [pendingProjects, setPendingProjects] = useState<Project[]>([])
  const [pendingHours, setPendingHours] = useState<HourSubmission[]>([])
  const [pendingEdits, setPendingEdits] = useState<ProjectEditRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectingEdit, setRejectingEdit] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchPendingItems()
    }
  }, [profile])

  const fetchPendingItems = async () => {
    try {
      // Fetch pending projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:created_by (
            full_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      // Fetch pending hours
      const { data: hours, error: hoursError } = await supabase
        .from('hour_submissions')
        .select(`
          *,
          projects (
            title
          ),
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })

      if (hoursError) throw hoursError

      // Fetch pending edit requests
      const editRequests = await getPendingEditRequests()

      setPendingProjects(projects || [])
      setPendingHours(hours || [])
      setPendingEdits(editRequests)
    } catch (error) {
      console.error('Error fetching pending items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectAction = async (projectId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: action })
        .eq('id', projectId)

      if (error) throw error
      setPendingProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleHourAction = async (submissionId: string, action: 'approved' | 'rejected') => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('hour_submissions')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile.id
        })
        .eq('id', submissionId)

      if (error) throw error
      setPendingHours(prev => prev.filter(h => h.id !== submissionId))
    } catch (error) {
      console.error('Error updating hour submission:', error)
    }
  }

  const handleEditAction = async (requestId: string, action: 'approved' | 'rejected') => {
    if (!profile) return

    try {
      if (action === 'approved') {
        await approveEditRequest(requestId, profile.id)
      } else {
        await rejectEditRequest(requestId, profile.id, adminNotes)
      }
      
      setPendingEdits(prev => prev.filter(e => e.id !== requestId))
      setRejectingEdit(null)
      setAdminNotes('')
    } catch (error) {
      console.error('Error updating edit request:', error)
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-xl border border-red-200 rounded-3xl p-12 shadow-2xl shadow-red-500/20 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/30">
            <AlertTriangle className="h-12 w-12 text-white" />
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            ACCESS RESTRICTED
          </div>
          <p className="text-red-700 font-medium text-lg">
            You need admin privileges to view this page.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white/90 backdrop-blur-xl border border-green-200 rounded-2xl p-8 shadow-2xl shadow-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xl font-semibold text-green-800">Loading Admin Panel...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Admin Dashboard
        </h1>
        <p className="text-green-700 font-medium text-xl">
          Review and manage pending service items
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl border border-green-200 rounded-3xl p-8 shadow-xl shadow-green-500/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <div className="text-4xl font-bold text-green-700 mb-2">{pendingProjects.length}</div>
          <div className="text-green-600 font-semibold">Pending Service Projects</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-xl border border-yellow-200 rounded-3xl p-8 shadow-xl shadow-yellow-500/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
            <Clock className="h-10 w-10 text-white" />
          </div>
          <div className="text-4xl font-bold text-yellow-700 mb-2">{pendingHours.length}</div>
          <div className="text-yellow-600 font-semibold">Pending Service Hours</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl border border-purple-200 rounded-3xl p-8 shadow-xl shadow-purple-500/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <Edit className="h-10 w-10 text-white" />
          </div>
          <div className="text-4xl font-bold text-purple-700 mb-2">{pendingEdits.length}</div>
          <div className="text-purple-600 font-semibold">Pending Edit Requests</div>
        </div>
      </div>

      {/* Pending Edit Requests */}
      {pendingEdits.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-8 flex items-center justify-center space-x-3">
            <Edit className="h-8 w-8 text-purple-500" />
            <span>Pending Edit Requests</span>
          </h2>
          <div className="space-y-8">
            {pendingEdits.map((editRequest) => (
              <div
                key={editRequest.id}
                className="bg-white/80 backdrop-blur-xl border border-purple-200 rounded-3xl overflow-hidden shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-center">
                  <h3 className="text-3xl font-bold text-white flex items-center justify-center space-x-3">
                    <HandHeart className="h-8 w-8" />
                    <span>Edit Request: {editRequest.title}</span>
                  </h3>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                      <p className="text-sm font-bold text-green-600 mb-2 uppercase tracking-wide">Original Project</p>
                      <p className="font-bold text-green-800 text-xl">{editRequest.projects?.title}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-2xl p-6">
                      <p className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">Requested By</p>
                      <p className="font-bold text-blue-800 text-xl">{editRequest.profiles?.full_name || editRequest.profiles?.email}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 mb-8">
                    <h4 className="font-bold text-yellow-700 mb-6 text-2xl flex items-center space-x-3">
                      <Edit className="h-6 w-6" />
                      <span>Proposed Changes</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/70 border border-yellow-200 rounded-xl p-4">
                        <p className="font-bold text-yellow-700 uppercase tracking-wide mb-2">Title:</p>
                        <p className="text-yellow-800 font-medium text-lg">{editRequest.title}</p>
                      </div>
                      <div className="bg-white/70 border border-yellow-200 rounded-xl p-4">
                        <p className="font-bold text-yellow-700 uppercase tracking-wide mb-2">Location:</p>
                        <p className="text-yellow-800 font-medium text-lg">{editRequest.location}</p>
                      </div>
                      <div className="bg-white/70 border border-yellow-200 rounded-xl p-4">
                        <p className="font-bold text-yellow-700 uppercase tracking-wide mb-2">Date:</p>
                        <p className="text-yellow-800 font-medium text-lg">{new Date(editRequest.date).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white/70 border border-yellow-200 rounded-xl p-4">
                        <p className="font-bold text-yellow-700 uppercase tracking-wide mb-2">Hours:</p>
                        <p className="text-yellow-800 font-medium text-lg">{editRequest.expected_hours}</p>
                      </div>
                    </div>
                    <div className="mt-6 bg-white/70 border border-yellow-200 rounded-xl p-4">
                      <p className="font-bold text-yellow-700 uppercase tracking-wide mb-2">Description:</p>
                      <p className="text-yellow-800 font-medium text-lg leading-relaxed">{editRequest.description}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                    <p className="text-green-700 font-medium">
                      Submitted {new Date(editRequest.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {rejectingEdit === editRequest.id ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-lg font-bold text-green-800 mb-3">
                          Admin Notes (Optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={4}
                          className="w-full p-4 bg-green-50/50 border border-green-200 rounded-xl font-medium text-green-800 placeholder-green-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                          placeholder="Reason for rejection..."
                        />
                      </div>
                      <div className="flex space-x-6">
                        <button
                          onClick={() => handleEditAction(editRequest.id, 'rejected')}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => {
                            setRejectingEdit(null)
                            setAdminNotes('')
                          }}
                          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-400 hover:from-gray-400 hover:to-gray-300 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-gray-500/25"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-6">
                      <button
                        onClick={() => handleEditAction(editRequest.id, 'approved')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30"
                      >
                        <CheckCircle className="h-6 w-6" />
                        <span>Approve Edit</span>
                      </button>
                      <button
                        onClick={() => setRejectingEdit(editRequest.id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                      >
                        <XCircle className="h-6 w-6" />
                        <span>Reject Edit</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Projects */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-green-800 mb-8 flex items-center justify-center space-x-3">
          <Calendar className="h-8 w-8 text-green-500" />
          <span>Pending Service Project Approvals</span>
        </h2>
        {pendingProjects.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-green-200 rounded-3xl p-12 text-center shadow-xl shadow-green-500/10">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
              <HandHeart className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-800 mb-3">No pending service projects to review</p>
            <p className="text-green-600 font-medium">All service projects have been reviewed!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white/80 backdrop-blur-xl border border-green-200 rounded-3xl overflow-hidden shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
                  <h3 className="text-3xl font-bold text-white flex items-center justify-center space-x-3">
                    <HandHeart className="h-8 w-8" />
                    <span>{project.title}</span>
                  </h3>
                </div>

                <div className="p-8">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                    <p className="text-green-800 font-medium text-lg leading-relaxed">{project.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-2xl p-6 text-center">
                      <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                      <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">Date</p>
                      <p className="font-bold text-blue-800 text-lg">{new Date(project.date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
                      <HandHeart className="h-8 w-8 text-green-500 mx-auto mb-3" />
                      <p className="text-sm font-bold text-green-600 uppercase tracking-wide mb-2">Location</p>
                      <p className="font-bold text-green-800 text-lg">{project.location}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 text-center">
                      <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                      <p className="text-sm font-bold text-yellow-600 uppercase tracking-wide mb-2">Hours</p>
                      <p className="font-bold text-yellow-800 text-lg">{project.expected_hours}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 text-center">
                      <User className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                      <p className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-2">Created By</p>
                      <p className="font-bold text-purple-800 text-lg">{project.profiles?.full_name || project.profiles?.email}</p>
                    </div>
                  </div>

                  <div className="flex space-x-6">
                    <button
                      onClick={() => handleProjectAction(project.id, 'approved')}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30"
                    >
                      <CheckCircle className="h-6 w-6" />
                      <span>Approve Service Project</span>
                    </button>
                    <button
                      onClick={() => handleProjectAction(project.id, 'rejected')}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                    >
                      <XCircle className="h-6 w-6" />
                      <span>Reject Project</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Hours */}
      <div>
        <h2 className="text-3xl font-bold text-green-800 mb-8 flex items-center justify-center space-x-3">
          <Clock className="h-8 w-8 text-yellow-500" />
          <span>Pending Service Hour Approvals</span>
        </h2>
        {pendingHours.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-yellow-200 rounded-3xl p-12 text-center shadow-xl shadow-yellow-500/10">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-200">
              <Clock className="h-12 w-12 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-800 mb-3">No pending service hours to review</p>
            <p className="text-yellow-600 font-medium">All service hours have been reviewed!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingHours.map((submission) => (
              <div
                key={submission.id}
                className="bg-white/80 backdrop-blur-xl border border-yellow-200 rounded-3xl overflow-hidden shadow-xl shadow-yellow-500/10 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 text-center">
                  <h3 className="text-3xl font-bold text-white flex items-center justify-center space-x-3">
                    <Clock className="h-8 w-8" />
                    <span>{submission.projects?.title} - {submission.hours_completed} Service Hours</span>
                  </h3>
                </div>

                <div className="p-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
                    <p className="text-yellow-800 font-medium text-lg leading-relaxed">{submission.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Volunteer</p>
                        <p className="font-bold text-green-800 text-lg">
                          {submission.profiles?.full_name || submission.profiles?.email}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-2xl p-6 flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">Submitted</p>
                        <p className="font-bold text-blue-800 text-lg">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-6">
                    <button
                      onClick={() => handleHourAction(submission.id, 'approved')}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30"
                    >
                      <CheckCircle className="h-6 w-6" />
                      <span>Approve Hours</span>
                    </button>
                    <button
                      onClick={() => handleHourAction(submission.id, 'rejected')}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                    >
                      <XCircle className="h-6 w-6" />
                      <span>Reject Hours</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
