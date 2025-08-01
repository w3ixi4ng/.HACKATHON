import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { HandHeart, Heart, Users, Award } from 'lucide-react'

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, fullName)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-3xl border border-green-400 shadow-2xl shadow-green-500/25">
                <HandHeart className="h-16 w-16 text-white" fill="currentColor" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            SMU:SERVE
          </h1>
          <p className="text-green-700 font-medium text-xl flex items-center justify-center space-x-2">
            <Heart className="h-5 w-5 text-green-500" />
            <span>Empowering community impact</span>
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/90 backdrop-blur-xl border border-green-200 rounded-3xl shadow-2xl shadow-green-500/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-800 mb-2">
              {isLogin ? 'Welcome Back!' : 'Join Our Community'}
            </h2>
            <p className="text-green-600 font-medium">
              {isLogin 
                ? 'Continue your service journey' 
                : 'Start making a difference today'
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-green-800 font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-green-50/50 border border-green-200 rounded-xl text-green-800 placeholder-green-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-green-800 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-green-50/50 border border-green-200 rounded-xl text-green-800 placeholder-green-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-green-800 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-green-50/50 border border-green-200 rounded-xl text-green-800 placeholder-green-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-green-300 disabled:to-emerald-300 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                isLogin ? 'Sign In to Serve' : 'Join the Community'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-green-600 font-medium">
              {isLogin ? "New to our community? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-green-700 font-bold hover:text-green-800 transition-colors duration-300 underline"
              >
                {isLogin ? 'Join us today' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="bg-white/70 backdrop-blur-xl border border-green-200 rounded-2xl p-4 shadow-lg shadow-green-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <p className="text-green-800 font-semibold text-sm">Connect with Community</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-green-200 rounded-2xl p-4 shadow-lg shadow-green-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <HandHeart className="h-6 w-6 text-white" />
            </div>
            <p className="text-green-800 font-semibold text-sm">Make Real Impact</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-green-200 rounded-2xl p-4 shadow-lg shadow-green-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-white" />
            </div>
            <p className="text-green-800 font-semibold text-sm">Track Your Service</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
