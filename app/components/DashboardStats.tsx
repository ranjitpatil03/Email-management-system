import { Mail, AlertCircle, TrendingUp, Target, CheckCircle, XCircle, X } from 'lucide-react'

export type StatFilterType = 'critical' | 'highPriority' | 'opportunities' | null

interface SyncInfo {
  lastSyncTime: string | null
  totalEmailsSynced: number
  lastSyncSuccess: boolean | null
}

interface DashboardStatsProps {
  stats: {
    totalEmails: number
    criticalEmails: number
    highPriorityEmails: number
    businessOpportunities: number
  }
  emailUser?: string
  syncInfo?: SyncInfo
  activeStatFilter: StatFilterType
  onStatFilterChange: (filter: StatFilterType) => void
}

export default function DashboardStats({ stats, emailUser, syncInfo, activeStatFilter, onStatFilterChange }: DashboardStatsProps) {
  const statCards = [
    {
      id: 'total',
      title: 'Total Emails',
      value: stats.totalEmails,
      icon: <Mail className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50',
      filterable: false,
    },
    {
      id: 'critical',
      title: 'Critical Emails',
      value: stats.criticalEmails,
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      color: 'bg-red-50',
      filterable: true,
    },
    {
      id: 'highPriority',
      title: 'High Priority',
      value: stats.highPriorityEmails,
      icon: <Target className="h-6 w-6 text-orange-500" />,
      color: 'bg-orange-50',
      filterable: true,
    },
    {
      id: 'opportunities',
      title: 'Opportunities',
      value: stats.businessOpportunities,
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
      filterable: true,
    },
  ]

  const formatSyncTime = (isoString: string | null) => {
    if (!isoString) return 'Never'
    const date = new Date(isoString)
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitial = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const handleCardClick = (cardId: string, filterable: boolean) => {
    if (!filterable) return
    const filterId = cardId as StatFilterType
    if (activeStatFilter === filterId) {
      onStatFilterChange(null)
    } else {
      onStatFilterChange(filterId)
    }
  }

  return (
    <div className="space-y-5">
      {/* Connected Gmail Account Card */}
      {emailUser && (
        <div className="bg-white overflow-hidden rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar Circle */}
              <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                {getInitial(emailUser)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Connected Gmail</p>
                <p className="text-base font-semibold text-gray-900">{emailUser}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Sync</p>
              <p className="text-sm font-medium text-gray-900">
                {formatSyncTime(syncInfo?.lastSyncTime || null)}
              </p>
              <div className="flex items-center justify-end mt-1 space-x-1">
                {syncInfo?.lastSyncSuccess === true && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Success</span>
                  </>
                )}
                {syncInfo?.lastSyncSuccess === false && (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-600">Failed</span>
                  </>
                )}
                {syncInfo?.totalEmailsSynced !== undefined && syncInfo.totalEmailsSynced > 0 && (
                  <span className="text-xs text-gray-400 ml-2">
                    {syncInfo.totalEmailsSynced} emails
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Stat Filter Bar */}
      {activeStatFilter && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-primary-800">
              Active Filter:{' '}
              {activeStatFilter === 'critical' && 'Showing Critical emails only'}
              {activeStatFilter === 'highPriority' && 'Showing High priority emails only'}
              {activeStatFilter === 'opportunities' && 'Showing Opportunities (score ≥ 70) only'}
            </span>
          </div>
          <button
            onClick={() => onStatFilterChange(null)}
            className="flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filter
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const isActive = activeStatFilter === card.id
          return (
            <div
              key={card.title}
              onClick={() => handleCardClick(card.id, card.filterable)}
              className={`
                overflow-hidden rounded-lg border p-5
                ${card.filterable ? 'cursor-pointer transition-all duration-200' : ''}
                ${isActive 
                  ? 'ring-2 ring-primary-500 border-primary-500 shadow-md scale-[1.02]' 
                  : card.filterable 
                    ? 'hover:shadow-md hover:border-gray-300 hover:scale-[1.02]' 
                    : ''
                }
                ${isActive ? card.color : card.color}
              `}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {isActive && card.filterable ? (
                    <div className="relative">
                      {card.icon}
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full border-2 border-white"></div>
                    </div>
                  ) : (
                    card.icon
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className={`text-2xl font-semibold ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
                      {card.value}
                    </dd>
                  </dl>
                </div>
                {card.filterable && (
                  <div className="ml-2 flex-shrink-0">
                    <svg 
                      className={`h-5 w-5 transition-colors duration-200 ${isActive ? 'text-primary-500' : 'text-gray-300'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}