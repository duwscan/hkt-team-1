'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Monitor, 
  FileCode, 
  Tags, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Project {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
}

interface Screen {
  id: number
  name: string
  domain: string
  url_path: string
  project_id: number
  description: string
  is_active: boolean
}

interface TestScript {
  id: number
  name: string
  project_id: number
  screen_id: number
  version: number
  is_active: boolean
}

interface Tag {
  id: number
  name: string
  project_id: number
  color: string
  description: string
}

interface TestResult {
  id: number
  test_script_id: number
  project_id: number
  screen_id: number
  status: 'running' | 'completed' | 'failed'
  started_at: string
  completed_at: string | null
  execution_time: number | null
  error_message: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [projects, setProjects] = useState<Project[]>([])
  const [screens, setScreens] = useState<Screen[]>([])
  const [testScripts, setTestScripts] = useState<TestScript[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const apiKey = localStorage.getItem('chrome_recorder_api_key')
    if (!apiKey) {
      router.push('/')
      return
    }
    
    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    const apiKey = localStorage.getItem('chrome_recorder_api_key')
    if (!apiKey) return

    setIsLoading(true)
    try {
      const headers = { 'X-API-Key': apiKey }
      
      // Load all data in parallel
      const [projectsRes, screensRes, scriptsRes, tagsRes, resultsRes] = await Promise.all([
        fetch('/api/projects', { headers }),
        fetch('/api/screens', { headers }),
        fetch('/api/test-scripts', { headers }),
        fetch('/api/tags', { headers }),
        fetch('/api/test-results', { headers })
      ])

      if (projectsRes.ok) setProjects(await projectsRes.json())
      if (screensRes.ok) setScreens(await screensRes.json())
      if (scriptsRes.ok) setTestScripts(await scriptsRes.json())
      if (tagsRes.ok) setTags(await tagsRes.json())
      if (resultsRes.ok) setTestResults(await resultsRes.json())
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('chrome_recorder_api_key')
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100'
      case 'failed': return 'text-danger-600 bg-danger-100'
      case 'running': return 'text-warning-600 bg-warning-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="card">
        <div className="card-content">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Screens</p>
              <p className="text-2xl font-bold text-gray-900">{screens.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileCode className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Test Scripts</p>
              <p className="text-2xl font-bold text-gray-900">{testScripts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Test Results</p>
              <p className="text-2xl font-bold text-gray-900">{testResults.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card">
            <div className="card-content">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.is_active ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTestScripts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Test Scripts</h2>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Test Script
        </button>
      </div>
      
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Screen</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Version</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {testScripts.map((script) => (
                  <tr key={script.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">{script.name}</td>
                    <td className="py-3 px-4">
                      {projects.find(p => p.id === script.project_id)?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      {screens.find(s => s.id === script.screen_id)?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">v{script.version}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        script.is_active ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {script.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTestResults = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search results..."
              className="input pl-10 w-64"
            />
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Test Script</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Started</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result) => (
                  <tr key={result.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      {testScripts.find(s => s.id === result.test_script_id)?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      {projects.find(p => p.id === result.project_id)?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(result.started_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {result.execution_time ? `${result.execution_time}s` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Chrome Recorder Test Management System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'projects', label: 'Projects', icon: FolderOpen },
              { id: 'test-scripts', label: 'Test Scripts', icon: FileCode },
              { id: 'test-results', label: 'Test Results', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'test-scripts' && renderTestScripts()}
        {activeTab === 'test-results' && renderTestResults()}
      </main>
    </div>
  )
}