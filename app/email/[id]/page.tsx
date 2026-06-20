import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { fetchEmailById } from '../../lib/api'

interface EmailDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EmailDetailPage({ params }: EmailDetailPageProps) {
  const { id } = await params
  const email = await fetchEmailById(id)
  
  if (!email) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/"
          className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Email Details</h2>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">From</h3>
                <p className="mt-1 text-sm text-gray-900">{email.sender}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                <p className="mt-1 text-sm text-gray-900">{email.subject}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <span className={`mt-1 px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(email.category)}`}>
                  {email.category}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(email.priority)}`}>
                    {email.priority}
                  </span>
                  <div className="mt-1 text-sm text-gray-600">
                    Score: {email.priorityScore}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Received</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(email.receivedDate).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Opportunity Score</h3>
                <div className="flex items-center mt-1">
                  <div className="w-24 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getOpportunityColor(email.opportunityScore)}`}
                      style={{ width: `${Math.min(email.opportunityScore, 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {email.opportunityScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Priority Reasons */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500">Priority Reasons</h3>
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
                {email.priorityReasons && email.priorityReasons.length > 0 ? (
                  <ul className="space-y-2">
                    {email.priorityReasons.map((reason: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-900">
                        <span className="text-green-500 mr-2">✓</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No priority rules matched</p>
                )}
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500">Priority Breakdown</h3>
              <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4">
                {email.priorityBreakdown && email.priorityBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {email.priorityBreakdown.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-900">{item.ruleName}</span>
                        <span className={`text-sm font-medium ${item.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.score >= 0 ? '+' : ''}{item.score}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-sm text-gray-900">Total Score</span>
                        <span className="text-sm">{email.priorityScore}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-sm text-gray-900">Final Priority</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${getPriorityColor(email.priority)}`}>
                          {email.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No priority calculation available</p>
                )}
              </div>
            </div>

            {/* AI Summary */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500">AI Summary</h3>
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm text-gray-900">{email.summary}</p>
              </div>
            </div>

            {/* Opportunity Explanation */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500">Opportunity Explanation</h3>
              <div className="mt-3 bg-purple-50 border border-purple-100 rounded-lg p-4">
                <p className="text-sm text-gray-900">{email.opportunityExplanation}</p>
              </div>
            </div>

            {/* Email Content */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500">Email Content</h3>
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                  {email.content}
                </pre>
              </div>
            </div>

            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-500">Attachments</h3>
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-2">
                    {email.attachments.map((attachment: any) => (
                      <div 
                        key={attachment.id} 
                        className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 text-gray-400">
                            📎
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attachment.name}</div>
                            <div className="text-xs text-gray-500">{attachment.type} • {attachment.size}</div>
                          </div>
                        </div>
                        <button 
                          className="text-sm text-primary-600 hover:text-primary-800"
                          onClick={() => alert(`Mock download: ${attachment.name}`)}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Draft Reply */}
            {email.draftReply && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-500">Draft Reply</h3>
                <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                    {email.draftReply}
                  </pre>
                  <div className="mt-3 flex space-x-3">
                    <button 
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                      onClick={() => alert('Reply sent (mock)')}
                    >
                      Send Reply
                    </button>
                    <button 
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      onClick={() => alert('Reply copied to clipboard (mock)')}
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Action */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-500">Recommended Action</h3>
              <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <p className="text-sm text-gray-900">{email.recommendedAction}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Business': return 'bg-blue-100 text-blue-800'
    case 'Personal': return 'bg-green-100 text-green-800'
    case 'Marketing': return 'bg-purple-100 text-purple-800'
    case 'Support': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
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

function getOpportunityColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}
