import React, { useState } from 'react'
import { supabase, uploadProjectThumbnail } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { X, Calendar, MapPin, Clock, FileText, Upload, Image as ImageIcon } from 'lucide-react'

interface CreateProjectModalProps {
  onClose: () => void
  onSuccess: () => void
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [expectedHours, setExpectedHours] = useState(1)
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const { profile } = useAuth()

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB')
        return
      }

      setThumbnailFile(file)
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    setError('')

    try {
      let thumbnailUrl = ''

      // Upload thumbnail if provided
      if (thumbnailFile) {
        setUploadingImage(true)
        thumbnailUrl = await uploadProjectThumbnail(thumbnailFile, profile.id)
        setUploadingImage(false)
      }

      const { error } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          expected_hours: expectedHours,
          location,
          date,
          thumbnail_url: thumbnailUrl,
          created_by: profile.id
        })

      if (error) throw error
      onSuccess()
    } catch (err: any) {
      setError(err.message)
      setUploadingImage(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-green-50 border border-green-300 rounded-3xl shadow-2xl shadow-green-200/40 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 rounded-t-3xl flex justify-between items-center border-b border-green-300">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-green-700 mb-2">
                Project Title
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-xl font-medium text-green-900 placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  placeholder="Beach Cleanup Drive"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-green-700 mb-2">
                Project Thumbnail
              </label>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border border-green-300 border-dashed rounded-xl cursor-pointer bg-green-50 hover:bg-green-100 transition-all duration-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-20 h-20 object-cover rounded-xl border border-green-300"
                        />
                      ) : (
                        <>
                          <FileText className="w-8 h-8 mb-2 text-green-400" />
                          <p className="mb-2 text-sm text-green-700 font-medium">
                            <span className="font-bold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-green-400">PNG, JPG, WEBP up to 5MB</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                </div>
                {thumbnailPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null)
                      setThumbnailPreview('')
                    }}
                    className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors duration-300"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-green-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-4 bg-green-50 border border-green-300 rounded-xl font-medium text-green-900 placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 resize-none"
                placeholder="Join us for a community beach cleanup to help protect our marine environment..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">
                  Expected Hours
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={expectedHours}
                    onChange={(e) => setExpectedHours(parseInt(e.target.value))}
                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-xl font-medium text-green-900 placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-green-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-xl font-medium text-green-900 placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-green-700 mb-2">
                Location
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-300 rounded-xl font-medium text-green-900 placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  placeholder="Santa Monica Beach, CA"
                  required
                />
              </div>
            </div>

            <div className="bg-green-100 border border-green-200 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-green-700 font-medium text-sm">
                <strong>Note:</strong> Your project will need admin approval before it appears to other users.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-green-200/70 hover:bg-green-200 text-green-900 py-3 px-6 rounded-xl font-bold transition-all duration-300 border border-green-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-green-200/25"
              >
                {uploadingImage ? (
                  <>
                    <span className="animate-spin mr-2"><Clock className="h-4 w-4" /></span>
                    <span>Uploading Image...</span>
                  </>
                ) : loading ? (
                  <span>Creating...</span>
                ) : (
                  <span>Create Project</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal
