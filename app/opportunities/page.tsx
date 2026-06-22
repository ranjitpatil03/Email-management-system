'use client'

import { useState, useMemo, useEffect } from 'react'
import { TrendingUp, Target, Building, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { fetchEmails, type Email } from '../lib/api'

export default function OpportunitiesPage() {
  const [allEmails, setAllEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEmails = async () => {
      try {
        const emails = await fetchEmails()
        setAllEmails(emails)
      } catch (error) {
        console.error('Error loading emails:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEmails()
  }, [])
  
  // Filter emails with opportunity score >= 50
  const opportunityEmails = useMemo(() => {
    return allEmails
      .filter(email => email.opportunityScore >= 50)
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
  }, [allEmails])

  // Extract client name from email sender
  const getClientName = (sender: string) => {
    const emailParts = sender.split('@')
    const username = emailParts[0]
    const domain = emailParts[1]?.split('.')[0] || ''
    
    // Convert to readable name
    if (username.includes('.')) {
      const nameParts = username.split('.')
      return nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    }
    
    return domain.charAt(0).toUpperCase() + domain.slice(1) || 'Client'
  }

  // Get opportunity type based on content
  const getOpportunityType = (email: any) => {
    const content = (email.subject + ' ' + email.content).toLowerCase()
    if (content.includes('investment') || content.includes('funding') || content.includes('series')) {
      return 'Investment'
    }
    if (content.includes('partnership') || content.includes('collaboration')) {
      return 'Partnership'
    }
    if (content.includes('license') || content.includes('enterprise') || content.includes('500+')) {
      return 'Enterprise Sale'
    }
    if (content.includes('speaking') || content.includes('conference') || content.includes('summit')) {
      return 'Speaking Engagement'
    }
    if (content.includes('research') || content.includes('academic') || content.includes('university')) {
      return 'Research Collaboration'
    }
    return 'Business Opportunity'
  }

  // Get estimated value (mock)
  const getEstimatedValue = (email: any) => {
    const score = email.opportunityScore
    if (score >= 90) return '$500K+'
    if (score >= 80) return '$100K - $500K'
    if (score >= 70) return '$50K - $100K'
    if (score >= 60) return '$25K - $50K'
    if (score >= 50) return '$10K - $25K'
    return 'To be determined'
  }

  // Get timeline (mock)
  const getTimeline = (email: any) => {
    const content = email.content.toLowerCase()
    if (content.includes('urgent') || content.includes('asap') || content.includes('immediate')) {
      return 'Immediate'
    }
    if (content.includes('next week') || content.includes('7 days')) {
      return '1 week'
    }
    if (content.includes('month') || content.includes('30 days')) {
      return '1 month'
    }
    if (content.includes('quarter') || content.includes('90 days')) {
      return '1 quarter'
    }
    return 'Open'
  }

  // Stats
  const totalOpportunities = opportunityEmails.length
  const highValueOpportunities = opportunityEmails.filter(e => e.opportunityScore >= 80).length
  const immediateOpportunities = opportunityEmails.filter(e => 
    e.content.toLowerCase().includes('urgent') || e.subject.toLowerCase().includes('urgent')
  ).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opportunity Center</h1>
          <p className="text-gray-600">Track and manage business opportunities identified in emails</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading opportunities from database...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Opportunity Center</h1>
        <p className="text-gray-600">Track and manage business opportunities identified in emails</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{totalOpportunities}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">High Value (80%+)</p>
              <p className="text-2xl font-bold text-gray-900">{highValueOpportunities}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Immediate Attention</p>
              <p className="text-2xl font-bold text-gray-900">{immediateOpportunities}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunity Table */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Opportunities Overview</h2>
          <p className="mt-1 text-sm text-gray-600">
            {opportunityEmails.length} opportunities identified from emails
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opportunity Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opportunity Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {opportunityEmails.map((email) => {
                const clientName = getClientName(email.sender)
                const opportunityType = getOpportunityType(email)
                const estimatedValue = getEstimatedValue(email)
                const timeline = getTimeline(email)
                
                return (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {email.summary.substring(0, 60)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(opportunityType)}`}>
                        {opportunityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getOpportunityColor(email.opportunityScore)}`}
                            style={{ width: `${email.opportunityScore}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {email.opportunityScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-900">{estimatedValue}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-900">{timeline}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/email/${email.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Email
                        </Link>
                        <button
                          onClick={() => alert(`Opportunity tracked: ${email.subject}`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Track
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Opportunity Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Value Opportunities */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">High Value Opportunities</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {opportunityEmails.filter(e => e.opportunityScore >= 80).length > 0 ? (
              <div className="space-y-4">
                {opportunityEmails
                  .filter(e => e.opportunityScore >= 80)
                  .map(email => (
                    <div key={email.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900">{email.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{email.opportunityExplanation}</p>
                      <div className="mt-3">
                        <span className="text-xs font-medium text-green-700">
                          Recommended: {email.recommendedAction}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No high value opportunities</p>
            )}
          </div>
        </div>

        {/* Immediate Attention Opportunities */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Immediate Attention Needed</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {immediateOpportunities > 0 ? (
              <div className="space-y-4">
                {opportunityEmails
                  .filter(e => e.content.toLowerCase().includes('urgent') || e.subject.toLowerCase().includes('urgent'))
                  .map(email => (
                    <div key={email.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900">{email.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">From: {email.sender}</p>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-red-700">
                          ⚠️ Requires immediate response
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No immediate attention opportunities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getTypeColor(type: string): string {
  switch (type) {
    case 'Investment': return 'bg-purple-100 text-purple-800'
    case 'Partnership': return 'bg-blue-100 text-blue-800'
    case 'Enterprise Sale': return 'bg-green-100 text-green-800'
    case 'Speaking Engagement': return 'bg-yellow-100 text-yellow-800'
    case 'Research Collaboration': return 'bg-indigo-100 text-indigo-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getOpportunityColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  return 'bg-yellow-500'
}