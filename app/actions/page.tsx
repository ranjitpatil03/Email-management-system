'use client'

import { useState, useMemo } from 'react'
import { CheckCircle, AlertCircle, Calendar, Mail, Clock, Target } from 'lucide-react'
import { getMockEmails } from '../data/mockData'
import Link from 'next/link'

export default function PendingActionsPage() {
  const allEmails = getMockEmails()
  
  // Generate mock tasks from emails
  const mockTasks = useMemo(() => {
    const tasks = []
    
    // Tasks from emails with draft replies
    const replyTasks = allEmails
      .filter(email => email.draftReply && email.draftReply.length > 0)
      .map(email => ({
        id: `reply-${email.id}`,
        name: `Reply to: ${email.subject}`,
        relatedEmail: email,
        priority: email.priority,
        dueDate: getDueDateFromEmail(email),
        status: 'pending',
        type: 'reply',
        description: `Send response to ${email.sender}`,
        estimatedDuration: '15 minutes'
      }))
    
    // Tasks from emails with attachments
    const attachmentTasks = allEmails
      .filter(email => email.attachments && email.attachments.length > 0)
      .map(email => ({
        id: `attachment-${email.id}`,
        name: `Review attachments: ${email.subject}`,
        relatedEmail: email,
        priority: email.priority === 'Critical' ? 'High' : email.priority,
        dueDate: getDueDateFromEmail(email),
        status: 'pending',
        type: 'review',
        description: `Review ${email.attachments?.length || 0} attachment(s)`,
        estimatedDuration: '30 minutes'
      }))
    
    // Tasks from high priority emails
    const highPriorityTasks = allEmails
      .filter(email => email.priority === 'High' || email.priority === 'Critical')
      .map(email => ({
        id: `priority-${email.id}`,
        name: `Follow up: ${email.subject}`,
        relatedEmail: email,
        priority: email.priority,
        dueDate: getDueDateFromEmail(email, true),
        status: 'pending',
        type: 'followup',
        description: email.recommendedAction,
        estimatedDuration: '1 hour'
      }))
    
    // Tasks from opportunity emails
    const opportunityTasks = allEmails
      .filter(email => email.opportunityScore >= 70)
      .map(email => ({
        id: `opportunity-${email.id}`,
        name: `Pursue opportunity: ${email.subject.substring(0, 40)}...`,
        relatedEmail: email,
        priority: 'High',
        dueDate: getDueDateFromEmail(email, false, 7), // 7 days for opportunities
        status: 'pending',
        type: 'opportunity',
        description: email.opportunityExplanation || 'Business opportunity identified',
        estimatedDuration: '2 hours'
      }))
    
    return [...replyTasks, ...attachmentTasks, ...highPriorityTasks, ...opportunityTasks]
  }, [allEmails])

  // Filter tasks by status
  const pendingTasks = mockTasks.filter(task => task.status === 'pending')
  const inProgressTasks = mockTasks.filter(task => task.status === 'in_progress')
  const completedTasks = mockTasks.filter(task => task.status === 'completed')

  // Filter by priority
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  
  const filteredTasks = useMemo(() => {
    if (priorityFilter === 'all') return pendingTasks
    return pendingTasks.filter(task => task.priority === priorityFilter)
  }, [pendingTasks, priorityFilter])

  // Stats
  const totalTasks = mockTasks.length
  const highPriorityTasks = mockTasks.filter(task => task.priority === 'High' || task.priority === 'Critical').length
  const overdueTasks = mockTasks.filter(task => {
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    return dueDate < today && task.status === 'pending'
  }).length

  // Update task status
  const updateTaskStatus = (taskId: string, newStatus: string) => {
    // In a real app, this would update the backend
    alert(`Task ${taskId} marked as ${newStatus} (mock update)`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Actions</h1>
        <p className="text-gray-600">Track and manage actions from email analysis</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{highPriorityTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{overdueTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${priorityFilter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'}`}
          >
            All Tasks ({pendingTasks.length})
          </button>
          <button
            onClick={() => setPriorityFilter('Critical')}
            className={`px-3 py-1 text-sm rounded-full ${priorityFilter === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Critical
          </button>
          <button
            onClick={() => setPriorityFilter('High')}
            className={`px-3 py-1 text-sm rounded-full ${priorityFilter === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}
          >
            High
          </button>
          <button
            onClick={() => setPriorityFilter('Medium')}
            className={`px-3 py-1 text-sm rounded-full ${priorityFilter === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Medium
          </button>
          <button
            onClick={() => setPriorityFilter('Low')}
            className={`px-3 py-1 text-sm rounded-full ${priorityFilter === 'Low' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Low
          </button>
        </div>
      </div>

      {/* Pending Tasks Table */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pending Actions</h2>
          <p className="mt-1 text-sm text-gray-600">
            {filteredTasks.length} actions requiring attention
            {priorityFilter !== 'all' && ` • Filtered by: ${priorityFilter}`}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Related Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => {
                const dueDate = new Date(task.dueDate)
                const today = new Date()
                const isOverdue = dueDate < today
                
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.name}</div>
                        <div className="text-xs text-gray-500">{task.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          ⏱️ {task.estimatedDuration}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {task.relatedEmail.subject.substring(0, 30)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            From: {task.relatedEmail.sender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className={`h-4 w-4 mr-2 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                        <div>
                          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {dueDate.toLocaleDateString()}
                          </div>
                          {isOverdue && (
                            <div className="text-xs text-red-500">Overdue</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(task.type)}`}>
                        {task.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          href={`/email/${task.relatedEmail.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Email
                        </Link>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Complete
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

      {/* Task Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Types */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Task Types</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-3">
              {[
                { type: 'reply', count: mockTasks.filter(t => t.type === 'reply').length, color: 'bg-blue-100 text-blue-800' },
                { type: 'review', count: mockTasks.filter(t => t.type === 'review').length, color: 'bg-purple-100 text-purple-800' },
                { type: 'followup', count: mockTasks.filter(t => t.type === 'followup').length, color: 'bg-green-100 text-green-800' },
                { type: 'opportunity', count: mockTasks.filter(t => t.type === 'opportunity').length, color: 'bg-yellow-100 text-yellow-800' },
              ].map(item => (
                <div key={item.type} className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.color}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <span className="text-sm text-gray-900">{item.count} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {pendingTasks
              .filter(task => {
                const dueDate = new Date(task.dueDate)
                const today = new Date()
                const nextWeek = new Date(today)
                nextWeek.setDate(today.getDate() + 7)
                return dueDate >= today && dueDate <= nextWeek
              })
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 5)
              .map(task => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-3 mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{task.name}</h3>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            {pendingTasks.filter(task => {
              const dueDate = new Date(task.dueDate)
              const today = new Date()
              const nextWeek = new Date(today)
              nextWeek.setDate(today.getDate() + 7)
              return dueDate >= today && dueDate <= nextWeek
            }).length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getDueDateFromEmail(email: any, urgent: boolean = false, daysOffset: number = 3): string {
  const baseDate = new Date(email.receivedDate)
  
  if (urgent) {
    // Urgent tasks due in 1-2 days
    baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 2) + 1)
  } else if (email.priority === 'Critical') {
    // Critical tasks due in 1 day
    baseDate.setDate(baseDate.getDate() + 1)
  } else if (email.priority === 'High') {
    // High priority tasks due in 2-3 days
    baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 2) + 2)
  } else if (email.priority === 'Medium') {
    // Medium priority tasks due in 3-5 days
    baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 3) + 3)
  } else {
    // Low priority tasks due in 5-7 days
    baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 3) + 5)
  }
  
  // Add daysOffset for specific task types
  if (daysOffset) {
    baseDate.setDate(baseDate.getDate() + daysOffset)
  }
  
  return baseDate.toISOString()
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Critical': return 'bg-red-100 text-red-800'
    case 'High': return 'bg-orange-100 text-orange-800'
    case 'Medium': return 'bg-yellow-100 text-yellow-800'
    case 'Low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'reply': return 'bg-blue-100 text-blue-800'
    case 'review': return 'bg-purple-100 text-purple-800'
    case 'followup': return 'bg-green-100 text-green-800'
    case 'opportunity': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}