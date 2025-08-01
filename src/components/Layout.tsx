import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Heart, LogOut, User, Calendar, Clock, Settings, Users, HandHeart } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Service Opportunities', icon: Calendar },
    { path: '/my-projects', label: 'My Service', icon: User },
    { path: '/hours', label: 'Impact Hours', icon: Clock },
    ...(profile?.role === 'admin' ? [
      { path: '/admin', label: 'Admin', icon: Settings },
      { path: '/users', label: 'Volunteers', icon: Users }
    ] : [])
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/90 backdrop-blur-xl border-b border-green-200 shadow-lg shadow-green-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl border border-green-400 shadow-xl shadow-green-500/25">
                  <HandHeart className="h-10 w-10 text-white" fill="currentColor" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  SMU:SERVE
                </h1>
                <p className="text-green-700 font-medium text-lg flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-green-500" />
                  <span>Empowering community impact</span>
                </p>
              </div>
            </Link>

            <div className="flex items-center space-x-6">
              <div className="text-right bg-white/70 backdrop-blur-xl border border-green-200 rounded-xl p-4 shadow-lg shadow-green-100/50">
                <div className="text-green-800 font-bold text-lg">
                  {profile?.full_name || profile?.email}
                </div>
                {profile?.role === 'admin' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white border border-orange-400 shadow-lg shadow-orange-500/25">
                    <Settings className="h-3 w-3 mr-1" />
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={signOut}
                className="relative group bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 text-white p-4 rounded-xl transition-all duration-300 border border-red-400 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
              >
                <LogOut className="h-6 w-6" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-300 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-xl border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-0">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`relative px-8 py-6 font-bold text-lg border-r border-green-100 transition-all duration-300 group ${
                  isActive(path)
                    ? 'text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
                    : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center space-x-3 relative z-10">
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </div>
                {isActive(path) && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-400/50"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  )
}

export default Layout
