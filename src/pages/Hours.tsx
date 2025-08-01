import React, { useState, useEffect } from 'react'
import { supabase, HourSubmission, Project } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Clock, Calendar, CheckCircle, XCircle, AlertCircle, Heart, Award, Target, HandHeart } from 'lucide-react'
import SubmitHoursModal from '../components/SubmitHoursModal'

const Hours: React.FC = () => {
  const [submissions, setSubmissions] = useState<HourSubmission[]>([])
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    fetchHourSubmissions()
    fetchAvailableProjects()
  }, [profile])

  const fetchHourSubmissions = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('hour_submissions')
        .select(`
          *,
          projects (
            title,
            expected_hours
          )
        `)
        .eq('user_id', profile.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching hour submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableProjects = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('project_signups')
        .select(`
          projects (
            id,
            title,
            expected_hours,
            date
          )
        `)
        .eq('user_id', profile.id)

      if (error) throw error
      setAvailableProjects(data?.map(signup => signup.projects).filter(Boolean) || [])
    } catch (error) {
      console.error('Error fetching available projects:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'from-green-100 to-emerald-100 border-green-200 text-green-800'
      case 'rejected': return 'from-red-100 to-pink-100 border-red-200 text-red-800'
      default: return 'from-yellow-100 to-orange-100 border-yellow-200 text-yellow-800'
    }
  }

  const totalHours = submissions
    .filter(sub => sub.status === 'approved')
    .reduce((sum, sub) => sum + sub.hours_completed, 0)

  const pendingHours = submissions
    .filter(sub => sub.status === 'pending')
    .reduce((sum, sub) => sum + sub.hours_completed, 0)

  const progressPercentage = Math.min((totalHours / 80) * 100, 100)
  const isCompleted = totalHours >= 80

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white/90 backdrop-blur-xl border border-green-200 rounded-2xl p-8 shadow-2xl shadow-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xl font-semibold text-green-800">Loading your service hours...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-12 space-y-6 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Service Impact Hours
          </h1>
          <p className="text-green-700 font-medium text-xl">
            Track your community service journey and impact
          </p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center space-x-3 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 hover:scale-105 group"
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
          <span>Submit Service Hours</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl border border-green-200 rounded-3xl p-8 shadow-xl shadow-green-500/20 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 group-hover:rotate-12 transition-transform duration-300">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <div className="text-5xl font-bold text-green-700 mb-3">{totalHours}</div>
          <div className="text-green-600 font-semibold text-lg">Hours of Service Completed</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-xl border border-yellow-200 rounded-3xl p-8 shadow-xl shadow-yellow-500/20 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30 group-hover:rotate-12 transition-transform duration-300">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <div className="text-5xl font-bold text-yellow-700 mb-3">{pendingHours}</div>
          <div className="text-yellow-600 font-semibold text-lg">Hours Awaiting Review</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-teal-50 backdrop-blur-xl border border-blue-200 rounded-3xl p-8 shadow-xl shadow-blue-500/20 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-300">
            <Target className="h-10 w-10 text-white" />
          </div>
          <div className="text-5xl font-bold text-blue-700 mb-3">{Math.min(totalHours, 80)}/80</div>
          <div className="text-blue-600 font-semibold text-lg">Service Goal Progress</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-gradient-to-br from-white/90 to-green-50/90 backdrop-blur-xl border border-green-200 rounded-3xl p-10 mb-12 shadow-2xl shadow-green-500/20">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 flex items-center justify-center space-x-3">
            <Award className="h-10 w-10 text-yellow-500" />
            <span>Your Service Journey</span>
            <Heart className="h-10 w-10 text-red-500" />
          </h2>
          <div className="text-3xl font-bold text-green-700 mb-2">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative w-full bg-green-100 rounded-full h-8 mb-8 border border-green-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-green-800 font-bold text-lg drop-shadow-sm">
              {totalHours} / 80 hours of service
            </span>
          </div>
        </div>

        {isCompleted ? (
          <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Congratulations, Community Champion!
            </h3>
            <p className="text-yellow-700 font-medium text-xl">
              You've completed your 80-hour service commitment! Your dedication is making a real difference in the community.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-green-700 font-medium text-lg">
              You're {80 - totalHours} hours away from completing your service commitment. Keep making a difference!
            </p>
          </div>
        )}
      </div>

      {/* Hour Submissions */}
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-8 flex items-center space-x-3">
          <HandHeart className="h-10 w-10 text-green-500" />
          <span>Your Service Submissions</span>
          <Heart className="h-10 w-10 text-red-500" />
        </h2>
        
        {submissions.length === 0 ? (
          <div className="bg-gradient-to-br from-white/90 to-green-50/90 backdrop-blur-xl border border-green-200 rounded-3xl p-16 text-center shadow-xl shadow-green-500/10">
            <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-200">
              <Clock className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-green-800 mb-4">
              Ready to Start Your Service Journey?
            </h3>
            <p className="text-green-600 font-medium text-lg mb-8 max-w-md mx-auto">
              You haven't submitted any service hours yet. Let's get started on documenting your community impact!
            </p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-green-500/25 hover:scale-105"
            >
              Submit Your First Service Hours
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="group bg-gradient-to-br from-white/90 to-green-50/90 backdrop-blur-xl border border-green-200 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-green-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
                        {submission.projects?.title}
                      </h3>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-xl px-4 py-2">
                          <span className="text-green-700 font-bold text-lg">
                            {submission.hours_completed} hours of service
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(submission.status)}
                      <span className={`px-4 py-2 text-sm font-bold rounded-full bg-gradient-to-r border ${getStatusColor(submission.status)}`}>
                        {submission.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50/50 border border-green-200 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-green-800 mb-3">Service Description:</h4>
                    <p className="text-green-700 font-medium leading-relaxed">
                      {submission.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-green-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Submitted {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    {submission.reviewed_at && (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span>Reviewed {new Date(submission.reviewed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSubmitModal && (
        <SubmitHoursModal
          projects={availableProjects}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false)
            fetchHourSubmissions()
          }}
        />
      )}
    </div>
  )
}

export default Hours
