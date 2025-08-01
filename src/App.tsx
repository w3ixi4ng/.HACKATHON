import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Auth from './components/Auth'
import Projects from './pages/Projects'
import MyProjects from './pages/MyProjects'
import Hours from './pages/Hours'
import Admin from './pages/Admin'
import UserManagement from './pages/UserManagement'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
      <div className="bg-white border-4 border-neutral-300 p-8 shadow-lg">
        <div className="text-2xl font-bold text-neutral-700">LOADING...</div>
      </div>
    </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Projects />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/hours" element={<Hours />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/users" element={<UserManagement />} />
      </Routes>
    </Layout>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
