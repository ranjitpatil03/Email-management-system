'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react'
import { fetchEmails } from '../lib/api'
import Link from 'next/link'

export default function DailyBriefingPage() {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEmails = async () => {
      setLoading(true)
      try {
        const data = await fetchEmails()
        setEmails(data)
      } catch (error) {
        console.error('Error loading emails:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadEmails()
  }, [])
  
  // Get critical emails
  const criticalEmails = emails.filter(email => email.priority === 'Critical')
  
  // Get high priority emails
  const highPriorityEmails = emails.filter(email => email.priority === 'High')
  
  // Get opportunities (opportunity score >= 70)
  const opportunities = emails.filter(email => email.opportunityScore >= 70)
  
  // Get emails with deadlines (mock data - emails with "deadline" in content)
  const deadlineEmails = emails.filter(email => 
    email.content.toLowerCase().includes('deadline') || 
    email.subject.toLowerCase().includes('deadline')
  )
  
  // Get pending actions (emails with draft replies but not sent)
  const pendingActions = emails.filter(email => email.draftReply && email.draftReply.length > 0)
  
  // Get today's date
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daily Briefing</h1>
        <p className="text-gray-600">{today}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Critical Emails</p>
              <p className="text-2xl font-bold text-gray-900">{criticalEmails.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{highPriorityEmails.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Pending Actions</p>
              <p className="text-2xl font-bold text-gray-900">{pendingActions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Upcoming Deadlines</p>
              <p className="text-2xl font-bold text-gray-900">{deadlineEmails.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Emails Section */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            Critical Emails Requiring Immediate Attention
          </h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {criticalEmails.length > 0 ? (
            <div className="space-y-4">
              {criticalEmails.map(email => (
                <div key={email.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{email.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">From: {email.sender}</p>
                      <p className="text-sm text-gray-600 mt-2">{email.summary}</p>
                    </div>
                    <Link
                      href={`/email/${email.id}`}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No critical emails today</p>
          )}
        </div>
      </div>

      {/* High Priority Emails Section */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Target className="h-5 w-5 text-orange-500 mr-2" />
            High Priority Emails
          </h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {highPriorityEmails.length > 0 ? (
            <div className="space-y-3">
              {highPriorityEmails.map(email => (
                <div key={email.id} className="border border-orange-200 bg-orange-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{email.subject}</h3>
                      <p className="text-xs text-gray-600">From: {email.sender}</p>
                    </div>
                    <Link
                      href={`/email/${email.id}`}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No high priority emails</p>
          )}
        </div>
      </div>

      {/* Opportunities Section */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            Business Opportunities
          </h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.map(email => (
                <div key={email.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{email.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">From: {email.sender}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${email.opportunityScore}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {email.opportunityScore}% Opportunity Score
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{email.opportunityExplanation}</p>
                    </div>
                    <Link
                      href={`/email/${email.id}`}
                      className="ml-4 text-sm text-primary-600 hover:text-primary-800 whitespace-nowrap"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No opportunities identified</p>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 text-purple-500 mr-2" />
            Upcoming Deadlines
          </h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {deadlineEmails.length > 0 ? (
            <div className="space-y-3">
              {deadlineEmails.map(email => {
                // Extract deadline from content (mock extraction)
                const contentLower = email.content.toLowerCase()
                let deadlineText = 'Soon'
                if (contentLower.includes('friday')) deadlineText = 'Friday'
                if (contentLower.includes('next week')) deadlineText = 'Next Week'
                if (contentLower.includes('30 days')) deadlineText = '30 days'
                
                return (
                  <div key={email.id} className="border border-purple-200 bg-purple-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{email.subject}</h3>
                        <p className="text-xs text-gray-600">From: {email.sender}</p>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Deadline: {deadlineText}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/email/${email.id}`}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
          )}
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
            Pending Actions
          </h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {pendingActions.length > 0 ? (
            <div className="space-y-3">
              {pendingActions.map(email => (
                <div key={email.id} className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Reply to: {email.subject}</h3>
                      <p className="text-xs text-gray-600">From: {email.sender}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Draft reply prepared - {email.draftReply?.length || 0} characters
                      </p>
                    </div>
                    <Link
                      href={`/email/${email.id}`}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      Send Reply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No pending actions</p>
          )}
        </div>
      </div>
    </div>
  )
}