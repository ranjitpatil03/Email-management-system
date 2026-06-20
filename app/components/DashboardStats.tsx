import { Mail, AlertCircle, TrendingUp, Target, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

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
}

export default function DashboardStats({ stats, emailUser, syncInfo }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Emails',
      value: stats.totalEmails,
      icon: <Mail className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Critical Emails',
      value: stats.criticalEmails,
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      color: 'bg-red-50',
    },
    {
      title: 'High Priority',
      value: stats.highPriorityEmails,
      icon: <Target className="h-6 w-6 text-orange-500" />,
      color: 'bg-orange-50',
    },
    {
      title: 'Opportunities',
      value: stats.businessOpportunities,
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`${card.color} overflow-hidden rounded-lg border border-gray-200 p-5`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">{card.icon}</div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {card.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
