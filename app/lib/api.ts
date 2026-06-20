// API utility functions for fetching data from the database

const API_BASE = ''

export interface Email {
  id: string
  sender: string
  subject: string
  content: string
  summary: string
  category: string
  priority: string
  opportunityScore: number
  receivedDate: string
  recommendedAction: string
  priorityReasons: string[]
  priorityScore: number
  priorityBreakdown: Array<{
    ruleName: string
    score: number
    description: string
  }>
  attachments: Array<{
    id: string
    name: string
    size: string
    type: string
  }>
  draftReply: string
  opportunityExplanation: string
}

export interface FilterOptions {
  priority: string[]
  category: string[]
  opportunityLevel: string[]
}

export async function fetchEmails(filters?: FilterOptions, search?: string): Promise<Email[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams()
    
    if (search) {
      params.append('search', search)
    }
    
    if (filters?.priority.length) {
      params.append('priority', filters.priority.join(','))
    }
    
    if (filters?.category.length) {
      params.append('category', filters.category.join(','))
    }
    
    if (filters?.opportunityLevel.length) {
      params.append('opportunityLevel', filters.opportunityLevel.join(','))
    }
    
    const url = `${API_BASE}/api/emails${params.toString() ? `?${params.toString()}` : ''}`
    
    const response = await fetch(url, {
      cache: 'no-store', // Don't cache API requests
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.emails || []
    
  } catch (error) {
    console.error('Error fetching emails:', error)
    // Fallback to mock data for now
    return []
  }
}

export async function fetchEmailById(id: string): Promise<Email | null> {
  try {
    const response = await fetch(`${API_BASE}/api/emails/${id}`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch email: ${response.statusText}`)
    }
    
    return await response.json()
    
  } catch (error) {
    console.error('Error fetching email:', error)
    return null
  }
}

export async function fetchDashboardStats() {
  try {
    const emails = await fetchEmails()
    
    return {
      totalEmails: emails.length,
      criticalEmails: emails.filter(e => e.priority === 'Critical').length,
      highPriorityEmails: emails.filter(e => e.priority === 'High').length,
      businessOpportunities: emails.filter(e => e.opportunityScore >= 70).length,
    }
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalEmails: 0,
      criticalEmails: 0,
      highPriorityEmails: 0,
      businessOpportunities: 0,
    }
  }
}