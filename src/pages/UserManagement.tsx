import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, Profile } from '../lib/supabase'
import { Shield, User, Crown, AlertCircle, Heart, Users, HandHeart } from 'lucide-react'

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { profile, promoteUserToAdmin } = useAuth()

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers()
    }
  }, [profile])

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load volunteers')
    } finally {
      setLoading(false)
    }
  }

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      await promoteUserToAdmin(userId)
      await fetchUsers() // Refresh the list
    } catch (error: any) {
      console.error('Error promoting user:', error)
      setError(error.message || 'Failed to promote volunteer to admin')
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-xl border border-red-200 rounded-3xl p-12 shadow-2xl shadow-red-500/20 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/30">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            ACCESS RESTRICTED
          </div>
          <p className="text-red-700 font-medium text-lg">
            You need admin privileges to manage volunteers.
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
            <div className="text-xl font-semibold text-green-800">Loading volunteers...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Volunteer Management
        </h1>
        <p className="text-green-700 font-medium text-xl">
          Manage your amazing community volunteers
        </p>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-xl border border-red-200 text-red-800 p-6 rounded-2xl mb-8 font-medium flex items-center space-x-3 shadow-lg shadow-red-500/20">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <span className="text-lg">{error}</span>
        </div>
      )}

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl border border-green-200 rounded-3xl p-8 shadow-xl shadow-green-500/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
            <Users className="h-10 w-10 text-white" />
          </div>
          <div className="text-4xl font-bold text-green-700 mb-2">{users.length}</div>
          <div className="text-green-600 font-semibold">Total Volunteers</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-xl border border-yellow-200 rounded-3xl p-8 shadow-xl shadow-yellow-500/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <div className="text-4xl font-bold text-yellow-700 mb-2">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-yellow-600 font-semibold">Admins</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-teal-50 backdrop-blur-xl border border-blue-200 rounded-3xl p-8 shadow-xl shadow-blue-500/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <div className="text-4xl font-bold text-blue-700 mb-2">
            {users.filter(u => u.role === 'user').length}
          </div>
          <div className="text-blue-600 font-semibold">Active Volunteers</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/90 to-green-50/90 backdrop-blur-xl border border-green-200 rounded-3xl shadow-2xl shadow-green-500/20 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center space-x-3">
            <HandHeart className="h-8 w-8" />
            <span>Community Volunteers ({users.length})</span>
            <Heart className="h-8 w-8" />
          </h2>
        </div>

        <div className="p-8">
          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-200">
                <Users className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-800 mb-4">
                No volunteers found yet!
              </p>
              <p className="text-green-600 font-medium">
                Volunteers will appear here once they join your community service platform.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="group bg-gradient-to-br from-white/80 to-green-50/80 backdrop-blur-xl border border-green-200 rounded-2xl p-6 hover:border-green-300 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-green-500/20 hover:scale-105"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30' 
                        : 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30'
                    }`}>
                      {user.role === 'admin' ? (
                        <Crown className="h-8 w-8 text-white" />
                      ) : (
                        <User className="h-8 w-8 text-white" />
                      )}
                      {user.role === 'admin' && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Heart className="h-3 w-3 text-yellow-800" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-800 group-hover:text-green-600 transition-colors duration-300">
                        {user.full_name || 'Community Volunteer'}
                      </h3>
                      <p className="text-green-600 font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className={`px-4 py-2 text-sm font-bold rounded-full border-2 ${
                        user.role === 'admin' 
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-200 text-orange-800' 
                          : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'ADMIN' : 'VOLUNTEER'}
                      </span>
                      {user.id === profile?.id && (
                        <span className="bg-gradient-to-r from-blue-100 to-teal-100 border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                      <p className="text-sm font-medium text-green-700">
                        Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {user.role === 'user' && user.id !== profile?.id && (
                    <button
                      onClick={() => handlePromoteToAdmin(user.id)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 group"
                    >
                      <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span>PROMOTE TO ADMIN</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserManagement
