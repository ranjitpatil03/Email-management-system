'use client'

import { useState, useMemo, useEffect } from 'react'
import DashboardStats from './components/DashboardStats'
import EmailTable from './components/EmailTable'
import EmailFilters, { FilterOptions } from './components/EmailFilters'
import { fetchEmails, fetchDashboardStats, type Email } from './lib/api'

interface SyncInfo {
  lastSyncTime: string | null
  totalEmailsSynced: number
  lastSyncSuccess: boolean | null
}

export default function Home() {
  const [allEmails, setAllEmails] = useState<Email[]>([])
  const [stats, setStats] = useState({
    totalEmails: 0,
    criticalEmails: 0,
    highPriorityEmails: 0,
    businessOpportunities: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    priority: [],
    category: [],
    opportunityLevel: []
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)
  const [emailUser, setEmailUser] = useState('')
  const [syncInfo, setSyncInfo] = useState<SyncInfo>(() => {
    // Restore sync info from localStorage on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gmailSyncInfo')
      if (saved) {
        try { return JSON.parse(saved) } catch {}
      }
    }
    return { lastSyncTime: null, totalEmailsSynced: 0, lastSyncSuccess: null }
  })

  // Persist sync info to localStorage
  useEffect(() => {
    localStorage.setItem('gmailSyncInfo', JSON.stringify(syncInfo))
  }, [syncInfo])

  // Fetch emails and Gmail config on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [emails, dashboardStats, config] = await Promise.all([
          fetchEmails(),
          fetchDashboardStats(),
          fetch('/api/config').then(r => r.json()).catch(() => ({ emailUser: '' }))
        ])
        setAllEmails(emails)
        setStats(dashboardStats)
        if (config.emailUser) setEmailUser(config.emailUser)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Filter emails based on search and filters
  const filteredEmails = useMemo(() => {
    return allEmails.filter(email => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          email.sender.toLowerCase().includes(searchLower) ||
          email.subject.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(email.priority)) {
        return false
      }

      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(email.category)) {
        return false
      }

      // Opportunity level filter
      if (filters.opportunityLevel.length > 0) {
        let opportunityMatch = false
        for (const level of filters.opportunityLevel) {
          if (level === 'High (70-100)' && email.opportunityScore >= 70) {
            opportunityMatch = true
            break
          }
          if (level === 'Medium (40-69)' && email.opportunityScore >= 40 && email.opportunityScore < 70) {
            opportunityMatch = true
            break
          }
          if (level === 'Low (0-39)' && email.opportunityScore < 40) {
            opportunityMatch = true
            break
          }
        }
        if (!opportunityMatch) return false
      }

      return true
    })
  }, [allEmails, searchTerm, filters])

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
  }

  const handleRefresh = async () => {
    setLoading(true)
    setSyncResult(null)
    try {
      const [emails, dashboardStats] = await Promise.all([
        fetchEmails(),
        fetchDashboardStats()
      ])
      setAllEmails(emails)
      setStats(dashboardStats)
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncGmail = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const response = await fetch('/api/emails/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSyncResult({
          success: true,
          message: result.message,
          count: result.count
        })
        // Update sync tracking info
        setSyncInfo({
          lastSyncTime: result.lastSyncTime || new Date().toISOString(),
          totalEmailsSynced: result.count,
          lastSyncSuccess: true
        })
        // Refresh data after successful sync
        await handleRefresh()
      } else {
        setSyncResult({
          success: false,
          message: result.error || 'Sync failed',
          count: result.count
        })
        setSyncInfo(prev => ({
          ...prev,
          lastSyncSuccess: false
        }))
      }
    } catch (error) {
      console.error('Error syncing Gmail:', error)
      setSyncResult({
        success: false,
        message: 'Failed to connect to sync service'
      })
      setSyncInfo(prev => ({
        ...prev,
        lastSyncSuccess: false
      }))
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Dashboard</h1>
          <p className="text-gray-600">AI-powered email management and analysis</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading email data from database...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Dashboard</h1>
          <p className="text-gray-600">AI-powered email management and analysis</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading || syncing}
            className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button
            onClick={handleSyncGmail}
            disabled={syncing || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Syncing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Sync Gmail
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Sync Result Message */}
      {syncResult && (
        <div className={`p-4 rounded-lg ${syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {syncResult.success ? (
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {syncResult.message}
                {syncResult.count !== undefined && ` (${syncResult.count} emails)`}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSyncResult(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      <DashboardStats stats={stats} emailUser={emailUser} syncInfo={syncInfo} />
      
      <EmailFilters 
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
      />
      
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Recent Emails</h2>
            <p className="mt-1 text-sm text-gray-600">
              {filteredEmails.length} of {allEmails.length} emails shown
              {searchTerm && ` • Searching: "${searchTerm}"`}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Sorted by: Received Date
          </div>
        </div>
        {filteredEmails.length > 0 ? (
          <EmailTable emails={filteredEmails} />
        ) : (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-500">No emails found matching your filters.</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilters({ priority: [], category: [], opportunityLevel: [] })
              }}
              className="mt-2 text-sm text-primary-600 hover:text-primary-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}