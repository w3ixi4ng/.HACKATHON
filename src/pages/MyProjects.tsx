import React, { useState, useEffect } from 'react'
import { supabase, Project, ProjectEditRequest, getUserEditRequests } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Calendar, MapPin, Clock, Edit, Trash2, AlertCircle, CheckCircle, XCircle, HandHeart } from 'lucide-react'
import CreateProjectModal from '../components/CreateProjectModal'
import EditProjectModal from '../components/EditProjectModal'

const MyProjects: React.FC = () => {
  const [createdProjects, setCreatedProjects] = useState<Project[]>([])
  const [signedUpProjects, setSignedUpProjects] = useState<Project[]>([])
  const [editRequests, setEditRequests] = useState<ProjectEditRequest[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    fetchMyProjects()
  }, [profile])

  const fetchMyProjects = async () => {
    if (!profile) return

    try {
      // Fetch created projects
      const { data: created, error: createdError } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', profile.id)
        .order('created_at', { ascending: false })

      if (createdError) throw createdError

      // Fetch signed up projects
      const { data: signups, error: signupsError } = await supabase
        .from('project_signups')
        .select(`
          projects (
            *,
            profiles:created_by (
              full_name,
              email
            )
          )
        `)
        .eq('user_id', profile.id)

      if (signupsError) throw signupsError

      // Fetch edit requests
      const editRequestsData = await getUserEditRequests(profile.id)

      setCreatedProjects(created || [])
      setSignedUpProjects(signups?.map(signup => signup.projects).filter(Boolean) || [])
      setEditRequests(editRequestsData)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this service opportunity?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      setCreatedProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'from-green-500 to-emerald-400'
      case 'rejected': return 'from-red-500 to-red-400'
      case 'completed': return 'from-blue-500 to-blue-400'
      default: return 'from-yellow-500 to-yellow-400'
    }
  }

  const getEditRequestStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getEditRequestStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 border-green-200 text-green-800'
      case 'rejected': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white/90 backdrop-blur-xl border border-green-200 rounded-2xl p-8 shadow-2xl shadow-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xl font-semibold text-green-800">Loading your service activities...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            My Service Activities
          </h1>
          <p className="text-green-700 mt-1 font-medium">Manage your community service involvement</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30"
        >
          <Plus className="h-5 w-5" />
          <span>Create Service Opportunity</span>
        </button>
      </div>

      {/* Edit Requests */}
      {editRequests.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center space-x-3">
            <Edit className="h-8 w-8 text-orange-500" />
            <span>Edit Requests</span>
          </h2>
          <div className="space-y-4">
            {editRequests.map((request) => (
              <div
                key={request.id}
                className={`border rounded-xl p-4 backdrop-blur-xl ${getEditRequestStatusColor(request.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getEditRequestStatusIcon(request.status)}
                      <h3 className="font-bold">
                        Edit request for "{request.projects?.title}"
                      </h3>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/50">
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">
                      <strong>Requested changes:</strong> {request.title}
                    </p>
                    <p className="text-xs opacity-75">
                      Submitted {new Date(request.created_at).toLocaleDateString()}
                      {request.reviewed_at && (
                        <span>
                          {' • '}
                          Reviewed {new Date(request.reviewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {request.admin_notes && (
                      <div className="mt-2 p-2 bg-white/30 rounded text-sm">
                        <strong>Coordinator notes:</strong> {request.admin_notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Created Projects */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center space-x-3">
          <HandHeart className="h-8 w-8 text-green-500" />
          <span>Service Opportunities I Created</span>
        </h2>
        {createdProjects.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-green-200 rounded-2xl p-12 text-center shadow-xl shadow-green-500/10">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
              <Plus className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-3">No Service Opportunities Created</h3>
            <p className="text-green-600 mb-6 max-w-md mx-auto">
              You haven't created any service opportunities yet. Start by organizing your first community service project.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-green-500/25"
            >
              Create Your First Service Opportunity
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {createdProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white/80 backdrop-blur-xl border border-green-200 rounded-2xl overflow-hidden hover:border-green-300 transition-all duration-500 shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 relative overflow-hidden">
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl font-bold text-green-400">
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${getStatusColor(project.status)}`}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-green-600 mb-6 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3 text-sm text-green-700">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">
                        {new Date(project.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-green-700">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-200">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="font-medium">{project.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-green-700">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center border border-teal-200">
                        <Clock className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="font-medium">{project.expected_hours} hours of service</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="flex-1 bg-gradient-to-r from-blue-500/80 to-blue-400/80 hover:from-blue-400 hover:to-blue-300 text-white py-2 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex-1 bg-gradient-to-r from-red-500/80 to-red-400/80 hover:from-red-400 hover:to-red-300 text-white py-2 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signed Up Projects */}
      <div>
        <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-emerald-500" />
          <span>Service Opportunities I Joined</span>
        </h2>
        {signedUpProjects.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-emerald-200 rounded-2xl p-12 text-center shadow-xl shadow-emerald-500/10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
              <Calendar className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-800 mb-3">No Service Activities Joined</h3>
            <p className="text-emerald-600">
              You haven't joined any service opportunities yet. Browse available opportunities to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {signedUpProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white/80 backdrop-blur-xl border border-emerald-200 rounded-2xl overflow-hidden hover:border-emerald-300 transition-all duration-500 shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 relative overflow-hidden">
                  {project.thumbnail_url ? (
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl font-bold text-emerald-400">
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                      VOLUNTEERING
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-emerald-800 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-emerald-600 mb-6 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-emerald-700">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-200">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="font-medium">
                        {new Date(project.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-emerald-700">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center border border-teal-200">
                        <MapPin className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="font-medium">{project.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-emerald-700">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">{project.expected_hours} hours of service</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchMyProjects()
          }}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={() => {
            setEditingProject(null)
            fetchMyProjects()
          }}
        />
      )}
    </div>
  )
}

export default MyProjects
