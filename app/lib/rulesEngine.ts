// Email Prioritization Rules Engine

export interface PriorityRule {
  id: string
  name: string
  description: string
  condition: (email: EmailContent) => boolean
  score: number
  category: 'positive' | 'negative'
}

export interface EmailContent {
  sender: string
  subject: string
  content: string
  category: string
}

export interface PriorityResult {
  totalScore: number
  priority: string
  appliedRules: AppliedRule[]
  reasons: string[]
}

export interface AppliedRule {
  ruleId: string
  ruleName: string
  score: number
  matched: boolean
  reason: string
}

// Define VIP clients (in a real system, this would come from a database)
const VIP_CLIENTS = [
  'john.doe@techcorp.com',
  'sarah.miller@venturepartners.vc',
  'alex.wong@enterpriseco.com',
  'ceo@importantclient.com',
  'partner@premiumclient.com'
]

// Helper: combine subject + content into a single lowercase string for matching
function fullText(email: EmailContent): string {
  return `${email.subject} ${email.content}`.toLowerCase()
}

// Helper: check if any keyword in the array appears in the text
function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword))
}

// Define key terms for rule matching
const KEY_TERMS = {
  URGENT: ['urgent', 'emergency', 'immediate', 'critical', 'asap', 'attention required'],
  DEADLINE: ['deadline', 'due by', 'deadline:', 'due date', 'by end of', 'by tomorrow'],
  PROPOSAL: ['proposal required', 'proposal needed', 'submit proposal', 'send proposal', 'proposal submission'],
  PAYMENT: ['payment overdue', 'invoice overdue', 'past due', 'late payment', 'outstanding balance'],
  OPPORTUNITY: ['opportunity', 'partnership', 'collaboration', 'investment', 'funding', 'deal'],
  MARKETING: ['newsletter', 'promotion', 'marketing', 'advertisement', 'special offer', 'discount'],
  // --- New categories ---
  JOB: ['interview', 'recruiter', 'hiring', 'role', 'position', 'application', 'shortlisted', 'selected', 'offer', 'onboarding', 'assessment', 'deloitte', 'foundit', 'monster', 'naukri'],
  FINANCIAL_PAYMENT_FAILED: ['payment failed', 'payment declined', 'transaction failed'],
  FINANCIAL_REFUND: ['refund', 'refunded', 'refund initiated'],
  FINANCIAL_CREDITED: ['credited', 'amount credited', 'deposit confirmed'],
  FINANCIAL_DEBIT: ['debit alert', 'debited', 'amount debited'],
  FINANCIAL_ACCOUNT_RECOVERY: ['account recovery', 'account access', 'unusual activity', 'security alert'],
  TRAVEL_TRAIN_BOOKING: ['train booking', 'train ticket', 'railway booking'],
  TRAVEL_PNR: ['pnr', 'pnr status', 'pnr number'],
  TRAVEL_IRCTC_OTP: ['irctc otp', 'irctc verification', 'irctc booking'],
  TRAVEL_FLIGHT_CANCELLATION: ['flight cancellation', 'flight cancelled', 'flight delayed', 'flight rescheduled']
}

// Define the rules (exact requirements)
export const PRIORITY_RULES: PriorityRule[] = [
  // ── Existing rules ──────────────────────────────────────────────────
  {
    id: 'vip_client',
    name: 'VIP Client',
    description: 'Email from a VIP client',
    condition: (email) => VIP_CLIENTS.includes(email.sender.toLowerCase()),
    score: 50,
    category: 'positive'
  },
  {
    id: 'urgent_keyword',
    name: 'Urgent Keyword',
    description: 'Contains urgent/emergency keywords',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.URGENT),
    score: 30,
    category: 'positive'
  },
  {
    id: 'deadline_keyword',
    name: 'Deadline Keyword',
    description: 'Contains deadline/due date keywords',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.DEADLINE),
    score: 25,
    category: 'positive'
  },
  {
    id: 'proposal_required',
    name: 'Proposal Required',
    description: 'Requires a proposal or formal response',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.PROPOSAL),
    score: 35,
    category: 'positive'
  },
  {
    id: 'payment_overdue',
    name: 'Payment Overdue',
    description: 'Mentions overdue payment or invoice',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.PAYMENT),
    score: 40,
    category: 'positive'
  },
  {
    id: 'marketing_email',
    name: 'Marketing/Newsletter',
    description: 'Marketing or newsletter email',
    condition: (email) => {
      const text = fullText(email)
      return email.category.toLowerCase() === 'marketing' || 
             matchesAny(text, KEY_TERMS.MARKETING)
    },
    score: -50,
    category: 'negative'
  },

  // ── Job Opportunity rules ──────────────────────────────────────────
  {
    id: 'job_opportunity',
    name: 'Job Opportunity',
    description: 'Email about a job opening or recruitment',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.JOB),
    score: 40,
    category: 'positive'
  },

  // ── Financial Priority rules ──────────────────────────────────────
  {
    id: 'payment_failed',
    name: 'Payment Failed',
    description: 'Transaction or payment failure alert',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.FINANCIAL_PAYMENT_FAILED),
    score: 35,
    category: 'positive'
  },
  {
    id: 'refund',
    name: 'Refund',
    description: 'Refund processed or initiated',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.FINANCIAL_REFUND),
    score: 20,
    category: 'positive'
  },
  {
    id: 'credited',
    name: 'Amount Credited',
    description: 'Amount credited or deposited',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.FINANCIAL_CREDITED),
    score: 15,
    category: 'positive'
  },
  {
    id: 'debit_alert',
    name: 'Debit Alert',
    description: 'Debit transaction alert',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.FINANCIAL_DEBIT),
    score: 15,
    category: 'positive'
  },
  {
    id: 'account_recovery',
    name: 'Account Recovery',
    description: 'Account security or recovery alert',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.FINANCIAL_ACCOUNT_RECOVERY),
    score: 30,
    category: 'positive'
  },

  // ── Travel Priority rules ──────────────────────────────────────────
  {
    id: 'train_booking',
    name: 'Train Booking',
    description: 'Train booking confirmation',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.TRAVEL_TRAIN_BOOKING),
    score: 15,
    category: 'positive'
  },
  {
    id: 'pnr',
    name: 'PNR Confirmation',
    description: 'PNR number or status update',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.TRAVEL_PNR),
    score: 15,
    category: 'positive'
  },
  {
    id: 'irctc_otp',
    name: 'IRCTC OTP',
    description: 'IRCTC OTP or verification',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.TRAVEL_IRCTC_OTP),
    score: 20,
    category: 'positive'
  },
  {
    id: 'flight_cancellation',
    name: 'Flight Cancellation',
    description: 'Flight cancellation or delay alert',
    condition: (email) => matchesAny(fullText(email), KEY_TERMS.TRAVEL_FLIGHT_CANCELLATION),
    score: 40,
    category: 'positive'
  },

  // ── Expanded Opportunity detection ─────────────────────────────────
  {
    id: 'opportunity_expanded',
    name: 'Opportunity',
    description: 'Business or career opportunity detected',
    condition: (email) => {
      const text = fullText(email)
      // Use original OPPORTUNITY terms plus job-related keywords
      const expandedKeywords = [
        ...KEY_TERMS.OPPORTUNITY,
        'job', 'recruiter', 'interview', 'offer',
        'assessment', 'shortlisted', 'selected', 'hiring'
      ]
      return matchesAny(text, expandedKeywords)
    },
    score: 35,
    category: 'positive'
  }
]

export function calculatePriority(email: EmailContent, opportunityScore?: number): PriorityResult {
  const appliedRules: AppliedRule[] = []
  let totalScore = 0
  
  // Apply all rules
  for (const rule of PRIORITY_RULES) {
    const matched = rule.condition(email)
    if (matched) {
      appliedRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        score: rule.score,
        matched: true,
        reason: `${rule.name}: ${rule.description}`
      })
      totalScore += rule.score
    }
  }
  
  // Determine priority level based on score
  const priority = getPriorityLevel(totalScore)
  
  // Generate reasons from matched rules
  const reasons = appliedRules
    .filter(rule => rule.matched)
    .map(rule => rule.ruleName)
  
  return {
    totalScore,
    priority,
    appliedRules,
    reasons
  }
}

export function getPriorityLevel(score: number): string {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 30) return 'Medium'
  return 'Low'
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Critical': return 'bg-red-100 text-red-800'
    case 'High': return 'bg-orange-100 text-orange-800'
    case 'Medium': return 'bg-yellow-100 text-yellow-800'
    case 'Low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Helper function to get score breakdown for display
export function getScoreBreakdown(appliedRules: AppliedRule[]) {
  const positiveRules = appliedRules.filter(r => r.score > 0 && r.matched)
  const negativeRules = appliedRules.filter(r => r.score < 0 && r.matched)
  
  return {
    positiveRules,
    negativeRules,
    positiveTotal: positiveRules.reduce((sum, rule) => sum + rule.score, 0),
    negativeTotal: negativeRules.reduce((sum, rule) => sum + rule.score, 0)
  }
}

// Function to add a new rule dynamically
export function addCustomRule(rule: PriorityRule) {
  PRIORITY_RULES.push(rule)
}

// Function to update VIP client list
export function updateVipClients(newClients: string[]) {
  VIP_CLIENTS.length = 0
  VIP_CLIENTS.push(...newClients)
}

// Export VIP clients for reference
export { VIP_CLIENTS, KEY_TERMS }