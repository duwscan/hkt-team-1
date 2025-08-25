'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ApiKeyInfo {
  name: string
  is_active: boolean
  last_used_at: string | null
  expires_at: string | null
}

export default function HomePage() {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const storedApiKey = localStorage.getItem('chrome_recorder_api_key')
    if (storedApiKey) {
      validateApiKey(storedApiKey)
    }
  }, [])

  const validateApiKey = async (key: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/api-key', {
        headers: {
          'X-API-Key': key,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeyInfo(data)
        setIsAuthenticated(true)
        localStorage.setItem('chrome_recorder_api_key', key)
        toast.success('API key validated successfully!')
        router.push('/dashboard')
      } else {
        throw new Error('Invalid API key')
      }
    } catch (error) {
      toast.error('Invalid API key. Please try again.')
      setIsAuthenticated(false)
      setApiKeyInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      validateApiKey(apiKey.trim())
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('chrome_recorder_api_key')
    setIsAuthenticated(false)
    setApiKeyInfo(null)
    setApiKey('')
    router.push('/')
  }

  if (isAuthenticated && apiKeyInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card">
            <div className="card-header text-center">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
              <h1 className="card-title text-primary-900">Welcome!</h1>
              <p className="text-gray-600">You are authenticated with API key: {apiKeyInfo.name}</p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Status:</strong> {apiKeyInfo.is_active ? 'Active' : 'Inactive'}</p>
                  {apiKeyInfo.last_used_at && (
                    <p><strong>Last Used:</strong> {new Date(apiKeyInfo.last_used_at).toLocaleString()}</p>
                  )}
                  {apiKeyInfo.expires_at && (
                    <p><strong>Expires:</strong> {new Date(apiKeyInfo.expires_at).toLocaleString()}</p>
                  )}
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary w-full"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-secondary w-full"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="card-header text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="card-title text-primary-900">Chrome Recorder Test Management System</h1>
            <p className="text-gray-600">Enter your API key to access the admin panel</p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
                  API Key
                </label>
                <div className="relative">
                  <input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !apiKey.trim()}
                className="btn-primary w-full"
              >
                {isLoading ? 'Validating...' : 'Access Admin Panel'}
              </button>
            </form>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Need an API key?</p>
                  <p className="mt-1">Contact your system administrator to get an API key for accessing the Chrome Recorder Test Management System.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}