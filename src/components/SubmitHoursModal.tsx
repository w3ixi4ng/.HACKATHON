import React, { useState } from 'react'
import { supabase, Project } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { X, Clock, FileText, Calendar } from 'lucide-react'

interface SubmitHoursModalProps {
  projects: Project[]
  onClose: () => void
  onSuccess: () => void
}

const SubmitHoursModal: React.FC<SubmitHoursModalProps> = ({ projects, onClose, onSuccess }) => {
  const [selectedProject, setSelectedProject] = useState('')
  const [hoursCompleted, setHoursCompleted] = useState(1)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { profile } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('hour_submissions')
        .insert({
          project_id: selectedProject,
          user_id: profile.id,
          hours_completed: hoursCompleted,
          description
        })

      if (error) throw error
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-green-50 border border-green-300 rounded-3xl shadow-2xl shadow-green-200/40 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 rounded-t-3xl flex justify-between items-center border-b border-green-300">
          <h2 className="text-2xl font-bold text-white">Submit Service Hours</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-green-100 p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-700 p-4 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}


          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg font-bold text-gray-600 mb-4">
                You need to sign up for projects before submitting hours.
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-300 hover:to-green-400 text-white px-6 py-3 border border-green-300 rounded-xl font-bold shadow transition-all"
              >
                CLOSE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">
                  Select Project
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-xl font-medium text-green-900 placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    required
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">
                  Hours Completed
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={hoursCompleted}
                    onChange={(e) => setHoursCompleted(parseInt(e.target.value))}
                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-xl font-medium text-green-900 placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">
                  Description of Work
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3 h-5 w-5 text-green-400" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-xl font-medium text-green-900 placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 resize-none"
                    placeholder="Describe what you did during your service hours..."
                    required
                  />
                </div>
              </div>

              <div className="bg-green-100 border border-green-200 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-green-700 font-medium text-sm">
                  <strong>Note:</strong> Your submitted hours will need admin approval before being counted toward your total.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-green-200/70 hover:bg-green-200 text-green-900 py-3 px-6 rounded-xl font-bold transition-all duration-300 border border-green-300"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-green-200/25"
                >
                  {loading ? 'SUBMITTING...' : 'SUBMIT HOURS'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubmitHoursModal
