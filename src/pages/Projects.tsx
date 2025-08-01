import React, { useState, useEffect } from 'react'
import { supabase, Project } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, MapPin, Clock, Users, Plus, Image as ImageIcon, Search, Filter, HandHeart } from 'lucide-react'

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [signedUpProjects, setSignedUpProjects] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'location' | 'hours'>('all')
  const { profile } = useAuth()

  useEffect(() => {
    fetchProjects()
    fetchSignedUpProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, filterBy])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:created_by (
            full_name,
            email
          )
        `)
        .eq('status', 'approved')
        .order('date', { ascending: true })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSignedUpProjects = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('project_signups')
        .select('project_id')
        .eq('user_id', profile.id)

      if (error) throw error
      setSignedUpProjects(new Set(data?.map(signup => signup.project_id) || []))
    } catch (error) {
      console.error('Error fetching signups:', error)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProjects(filtered)
  }

  const handleSignUp = async (projectId: string) => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('project_signups')
        .insert({
          project_id: projectId,
          user_id: profile.id
        })

      if (error) throw error
      setSignedUpProjects(prev => new Set([...prev, projectId]))
    } catch (error) {
      console.error('Error signing up:', error)
    }
  }

  const handleWithdraw = async (projectId: string) => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('project_signups')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', profile.id)

      if (error) throw error
      setSignedUpProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    } catch (error) {
      console.error('Error withdrawing:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white/90 backdrop-blur-xl border border-green-200 rounded-2xl p-8 shadow-2xl shadow-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xl font-semibold text-green-800">Finding service opportunities...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Service Opportunities
          </h1>
          <p className="text-green-700 mt-1 font-medium">Make a difference in your community</p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 lg:w-96">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
            <input
              type="text"
              placeholder="Search service opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-xl border border-green-200 rounded-xl text-green-800 placeholder-green-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
            />
          </div>
          <button className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-green-500/25">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-xl border border-green-200 rounded-xl">
          <p className="text-green-700 font-medium">
            Found {filteredProjects.length} service opportunity{filteredProjects.length !== 1 ? 'ies' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-green-200 rounded-2xl p-12 text-center shadow-2xl shadow-green-500/10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
            <HandHeart className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-3">
            {searchTerm ? 'No Opportunities Found' : 'No Service Opportunities Available'}
          </h2>
          <p className="text-green-600 max-w-md mx-auto">
            {searchTerm 
              ? `No service opportunities match your search for "${searchTerm}". Try different keywords.`
              : 'Check back later for new ways to serve your community.'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-6 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all duration-300 border border-green-200"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-white/80 backdrop-blur-xl border border-green-200 rounded-2xl overflow-hidden hover:border-green-300 transition-all duration-500 shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 hover:scale-105"
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
                    <HandHeart className="h-16 w-16 text-green-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold border border-green-400">
                    {project.expected_hours}h service
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
                  <div className="flex items-center space-x-3 text-sm text-green-700">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">
                      Organized by {project.profiles?.full_name || project.profiles?.email}
                    </span>
                  </div>
                </div>

                {signedUpProjects.has(project.id) ? (
                  <button
                    onClick={() => handleWithdraw(project.id)}
                    className="w-full bg-gradient-to-r from-red-500/80 to-red-400/80 hover:from-red-400 hover:to-red-300 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 backdrop-blur-sm border border-red-400 hover:border-red-300 shadow-lg shadow-red-500/25"
                  >
                    Withdraw from Service
                  </button>
                ) : (
                  <button
                    onClick={() => handleSignUp(project.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Join Service</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects
