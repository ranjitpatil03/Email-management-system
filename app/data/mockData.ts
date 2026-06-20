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
  priorityBreakdown: PriorityBreakdown[]
  attachments?: Attachment[]
  draftReply?: string
  opportunityExplanation?: string
}

export interface PriorityBreakdown {
  ruleName: string
  score: number
  description: string
}

export interface Attachment {
  id: string
  name: string
  size: string
  type: string
}

import { calculatePriority } from '../lib/rulesEngine'

// Define base emails data
const baseEmailsData = [
    {
      id: '1',
      sender: 'john.doe@techcorp.com',
      subject: 'URGENT: Partnership Opportunity - AI Integration DEMO NEEDED by Friday',
      content: `Dear Team,\n\nI'm reaching out from TechCorp regarding a potential partnership. We've been following your work in AI-powered email management and believe our new AI integration platform could significantly enhance your product offerings.\n\nThis is URGENT - we need a proposal required by Friday deadline. Our platform offers real-time sentiment analysis, intent classification, and automated response generation. We'd like to schedule a demo next week to showcase how this could benefit your customers.\n\nLooking forward to discussing this further.\n\nBest regards,\nJohn Doe\nCEO, TechCorp`,
      summary: 'Partnership inquiry from TechCorp offering AI integration platform with sentiment analysis and automated responses. High business potential.',
      category: 'Business',
      priority: 'High',
      opportunityScore: 85,
      receivedDate: '2024-01-15T10:30:00Z',
      recommendedAction: 'Schedule meeting for demo next week. Prepare technical requirements document.',
      attachments: [
        { id: 'a1', name: 'TechCorp_Brochure.pdf', size: '2.4 MB', type: 'PDF' },
        { id: 'a2', name: 'Integration_Specs.docx', size: '1.8 MB', type: 'DOCX' }
      ],
      draftReply: `Dear John,\n\nThank you for reaching out regarding the partnership opportunity. We're very interested in your AI integration platform and would be delighted to schedule a demo for next week.\n\nCould you please provide available time slots? We'll prepare our technical team to discuss requirements.\n\nLooking forward to the discussion.\n\nBest regards,\nThe Team`,
      opportunityExplanation: 'High-value partnership opportunity with established AI company. Potential for significant revenue growth and technology enhancement.'
    },
    {
      id: '2',
      sender: 'support@clientplatform.com',
      subject: 'CRITICAL URGENT: System Outage Report - Immediate Action Required',
      content: `Emergency Notification:\n\nOur monitoring systems have detected a critical outage affecting 40% of users. The issue appears to be related to email synchronization. Immediate investigation required - this is URGENT.\n\nError codes: EC-5001, EC-5002\nImpact: Email delivery delayed by 2-3 hours\nAffected regions: North America, Europe\n\nDEADLINE: Please investigate and respond within 2 hours.\n\nSupport Team\nClient Platform Inc.`,
      summary: 'Critical system outage affecting email synchronization for 40% of users. Requires immediate technical investigation.',
      category: 'Support',
      priority: 'Critical',
      opportunityScore: 10,
      receivedDate: '2024-01-15T09:15:00Z',
      recommendedAction: 'Immediately escalate to engineering team. Begin incident response protocol.',
      draftReply: `Dear Support Team,\n\nWe have received your critical outage report and are immediately escalating to our engineering team. Our incident response protocol has been activated.\n\nWe will provide an update within the next hour.\n\nBest regards,\nTechnical Support`,
      opportunityExplanation: 'Critical support issue affecting major client. Resolution required to maintain service level agreements.'
    },
    {
      id: '3',
      sender: 'sarah.miller@venturepartners.vc',
      subject: 'Follow-up: Series A Investment Opportunity - Proposal Required',
      content: `Hello,\n\nFollowing up on our conversation last week regarding Series A funding. Our partners are very interested in your AI email management vision - this represents a significant investment opportunity.\n\nWe'd like to move forward with due diligence. Can you provide:\n1. Current MRR and growth metrics\n2. Technical roadmap for next 6 months\n3. Team composition update\n\nPROPOSAL REQUIRED: Please submit investment proposal by next Wednesday deadline.\n\nLet's schedule a call for Friday to discuss next steps.\n\nRegards,\nSarah Miller\nPartner, Venture Partners`,
      summary: 'VC follow-up for Series A funding discussion. Strong investor interest with request for due diligence materials.',
      category: 'Business',
      priority: 'High',
      opportunityScore: 90,
      receivedDate: '2024-01-14T16:45:00Z',
      recommendedAction: 'Prepare financial metrics and roadmap. Schedule call for Friday.',
      attachments: [
        { id: 'a3', name: 'Due_Diligence_Checklist.pdf', size: '3.2 MB', type: 'PDF' }
      ],
      draftReply: `Dear Sarah,\n\nThank you for following up on the Series A funding discussion. We're excited about the investment opportunity with Venture Partners.\n\nWe will prepare the requested materials and submit our investment proposal by Wednesday. Friday works well for a follow-up call.\n\nBest regards,\nCEO`,
      opportunityExplanation: 'Series A funding round with established venture capital firm. Potential for substantial growth capital and strategic partnership.'
    },
    {
      id: '4',
      sender: 'newsletter@techweekly.com',
      subject: 'Weekly Tech Insights - AI Trends 2024 Newsletter',
      content: `This Week in Tech:\n\nAI Integration Trends for 2024\n- Multimodal AI systems\n- Real-time processing advancements\n- Privacy-preserving AI techniques\n\nUpcoming Events:\n- AI Summit March 15-17\n- Email Tech Conference April 5-7\n\nRead the full article on our website.\n\nTech Weekly Team`,
      summary: 'Marketing newsletter discussing 2024 AI trends including multimodal systems and real-time processing.',
      category: 'Marketing',
      priority: 'Low',
      opportunityScore: 25,
      receivedDate: '2024-01-14T14:20:00Z',
      recommendedAction: 'Archive for future reference. No immediate action required.',
      opportunityExplanation: 'Industry newsletter for trend monitoring. Low immediate opportunity but useful for market intelligence.'
    },
    {
      id: '5',
      sender: 'alex.wong@enterpriseco.com',
      subject: 'URGENT: Enterprise License Inquiry - 500+ Users - Proposal Deadline Friday',
      content: `Dear Sales Team,\n\nWe're evaluating your email management system for our organization of 500+ employees. Currently using legacy system with limited AI capabilities.\n\nThis is URGENT - we need proposal required by Friday deadline.\n\nRequirements:\n- Custom AI model training\n- On-premise deployment option\n- SOC2 compliance documentation\n- SLA: 99.9% uptime\n\nPayment overdue: Please note our current system contract ends in 30 days.\n\nCan you provide pricing and schedule a technical deep dive?\n\nSincerely,\nAlex Wong\nCTO, EnterpriseCo`,
      summary: 'Large enterprise (500+ users) inquiry for custom AI solution with on-premise deployment requirements.',
      category: 'Business',
      priority: 'High',
      opportunityScore: 80,
      receivedDate: '2024-01-14T11:10:00Z',
      recommendedAction: 'Send enterprise pricing and compliance documentation. Schedule technical deep dive.',
      attachments: [
        { id: 'a5', name: 'Enterprise_Requirements.pdf', size: '4.1 MB', type: 'PDF' },
        { id: 'a6', name: 'Security_Questionnaire.docx', size: '2.3 MB', type: 'DOCX' }
      ],
      draftReply: `Dear Alex,\n\nThank you for your enterprise license inquiry. We are excited about the opportunity to work with EnterpriseCo and can meet your urgent Friday deadline.\n\nWe will provide a comprehensive proposal including custom AI training, on-premise deployment options, and all compliance documentation.\n\nWe will follow up to schedule a technical deep dive.\n\nBest regards,\nEnterprise Sales Team`,
      opportunityExplanation: 'Major enterprise deal with 500+ user license. High-value opportunity with potential for long-term partnership.'
    },
    {
      id: '6',
      sender: 'security@company.com',
      subject: 'Security Audit Findings - Action Required',
      content: `Security Team Report:\n\nRecent audit identified several vulnerabilities:\n1. API rate limiting not configured\n2. Email content scanning bypass possible\n3. Data retention policy not enforced\n\nSeverity: High\nDeadline for remediation: 30 days\n\nPlease review attached report and provide remediation plan.\n\nSecurity Department`,
      summary: 'Security audit findings with high severity vulnerabilities requiring remediation within 30 days.',
      category: 'Support',
      priority: 'Critical',
      opportunityScore: 5,
      receivedDate: '2024-01-13T17:30:00Z',
      recommendedAction: 'Immediate security review. Develop remediation plan within 7 days.'
    },
    {
      id: '7',
      sender: 'marketing@competitor.ai',
      subject: 'Competitor Analysis Request',
      content: `Team,\n\nOur competitor has launched a new AI email feature that looks promising. Please analyze:\n- Their new sentiment analysis capability\n- Pricing changes\n- Integration options\n\nWe need competitive analysis by end of week to adjust our roadmap.\n\nMarketing Team`,
      summary: 'Competitor analysis request for new AI email features. Requires competitive assessment.',
      category: 'Marketing',
      priority: 'Medium',
      opportunityScore: 40,
      receivedDate: '2024-01-13T15:45:00Z',
      recommendedAction: 'Begin competitive analysis. Schedule meeting to discuss findings.'
    },
    {
      id: '8',
      sender: 'legal@company.com',
      subject: 'GDPR Compliance Review - Email Processing',
      content: `Legal Department Memo:\n\nOur email processing system needs GDPR compliance review. Key areas:\n1. Data minimization in email analysis\n2. User consent mechanisms\n3. Right to be forgotten implementation\n\nSchedule meeting with legal team next week.\n\nLegal Department`,
      summary: 'GDPR compliance review required for email processing system. Legal meeting needed.',
      category: 'Business',
      priority: 'Medium',
      opportunityScore: 30,
      receivedDate: '2024-01-12T13:20:00Z',
      recommendedAction: 'Schedule legal compliance meeting. Review current data practices.'
    },
    {
      id: '9',
      sender: 'careers@techjobs.com',
      subject: 'AI Engineer Candidate - Senior Position',
      content: `Candidate Profile:\n\nName: Maria Chen\nExperience: 8 years AI/ML\nPrevious: Google AI Research\nSkills: NLP, Transformers, Email Systems\n\nAvailable for interview next week. Strong match for our senior AI engineer role.\n\nRecruiting Team`,
      summary: 'Strong AI engineering candidate with 8 years experience at Google AI Research.',
      category: 'Business',
      priority: 'Medium',
      opportunityScore: 60,
      receivedDate: '2024-01-12T10:05:00Z',
      recommendedAction: 'Schedule interview for next week. Prepare technical assessment.'
    },
    {
      id: '10',
      sender: 'events@aiconference.org',
      subject: 'Speaking Opportunity - AI Email Summit',
      content: `Invitation:\n\nWe'd like to invite you to speak at the AI Email Summit on March 20th.\n\nTopic: "The Future of AI-Powered Email Management"\nFormat: 30-minute keynote\nAudience: 500+ industry professionals\n\nPlease confirm availability by end of week.\n\nConference Committee`,
      summary: 'Speaking invitation for AI Email Summit keynote on future of AI-powered email management.',
      category: 'Marketing',
      priority: 'Medium',
      opportunityScore: 70,
      receivedDate: '2024-01-11T16:50:00Z',
      recommendedAction: 'Confirm speaking availability. Begin keynote preparation.'
    },
    {
      id: '11',
      sender: 'finance@company.com',
      subject: 'Q4 Financial Report - Review Required',
      content: `Q4 Financial Summary:\n\nRevenue: $2.5M (+35% YoY)\nCustomer Growth: 45%\nBurn Rate: $450K/month\nRunway: 18 months\n\nBoard meeting scheduled for Monday to review.\n\nFinance Department`,
      summary: 'Q4 financial report showing strong growth with 35% revenue increase and 45% customer growth.',
      category: 'Business',
      priority: 'Medium',
      opportunityScore: 50,
      receivedDate: '2024-01-11T14:15:00Z',
      recommendedAction: 'Review financial report. Prepare for board meeting.'
    },
    {
      id: '12',
      sender: 'user.feedback@company.com',
      subject: 'Feature Request - Bulk Email Processing',
      content: `Customer Feedback:\n\nMultiple enterprise customers requesting bulk email processing feature.\n\nCurrent limitation: 100 emails/hour\nRequested: 1000 emails/hour\n\nThis is becoming a deal blocker for larger clients.\n\nProduct Team`,
      summary: 'Customer feature request for bulk email processing capability from enterprise clients.',
      category: 'Support',
      priority: 'High',
      opportunityScore: 65,
      receivedDate: '2024-01-10T12:30:00Z',
      recommendedAction: 'Evaluate technical feasibility. Add to product roadmap.'
    },
    {
      id: '13',
      sender: 'research@university.edu',
      subject: 'Academic Collaboration Proposal',
      content: `Research Proposal:\n\nOur AI research lab is interested in collaborating on email classification algorithms.\n\nWe have access to large labeled email datasets and novel NLP techniques.\n\nProposal: Joint research paper + shared IP\n\nLet's schedule an introductory call.\n\nProfessor Johnson\nAI Research Lab`,
      summary: 'Academic collaboration proposal from university AI research lab for email classification algorithms.',
      category: 'Business',
      priority: 'Medium',
      opportunityScore: 75,
      receivedDate: '2024-01-10T09:45:00Z',
      recommendedAction: 'Schedule introductory call. Review research proposal.'
    },
    {
      id: '14',
      sender: 'api@integrationpartner.com',
      subject: 'API Integration Issue - Authentication',
      content: `Integration Issue:\n\nOur system integration is failing due to authentication timeout.\n\nError: OAuth token expires after 1 hour\nExpected: 24-hour tokens\n\nAffecting 15% of data sync operations.\n\nIntegration Team`,
      summary: 'API integration issue with authentication token timeout affecting data synchronization.',
      category: 'Support',
      priority: 'High',
      opportunityScore: 20,
      receivedDate: '2024-01-09T17:10:00Z',
      recommendedAction: 'Investigate authentication issue. Provide temporary workaround.'
    },
    {
      id: '15',
      sender: 'news@techcrunch.com',
      subject: 'Media Inquiry - AI Email Management Feature',
      content: `Media Request:\n\nTechCrunch is writing about AI email management trends and would like to interview your team.\n\nFocus: How AI is transforming enterprise email workflows\nTimeline: Article publishing in 2 weeks\n\nPlease let us know availability.\n\nTechCrunch Editorial`,
      summary: 'Media interview request from TechCrunch for article on AI email management trends.',
      category: 'Marketing',
      priority: 'Medium',
      opportunityScore: 85,
      receivedDate: '2024-01-09T14:25:00Z',
      recommendedAction: 'Schedule media interview. Prepare talking points on AI email transformation.'
    },
  ]

export function getMockEmails(): Email[] {
  // Calculate priority for each email using rules engine
  return baseEmailsData.map(email => {
    const emailContent = {
      sender: email.sender,
      subject: email.subject,
      content: email.content,
      category: email.category
    }
    
    const priorityResult = calculatePriority(emailContent)
    
    // Create priority breakdown
    const priorityBreakdown = priorityResult.appliedRules
      .filter(rule => rule.matched)
      .map(rule => ({
        ruleName: rule.ruleName,
        score: rule.score,
        description: rule.reason.split(': ')[1]
      }))
    
    return {
      ...email,
      priority: priorityResult.priority,
      priorityScore: priorityResult.totalScore,
      priorityReasons: priorityResult.reasons,
      priorityBreakdown,
      // Ensure all fields have values
      attachments: email.attachments || [],
      draftReply: email.draftReply || '',
      opportunityExplanation: email.opportunityExplanation || ''
    }
  })
}

export function getMockEmailById(id: string): Email | null {
  const email = baseEmailsData.find(email => email.id === id)
  if (!email) return null
  
  const emailContent = {
    sender: email.sender,
    subject: email.subject,
    content: email.content,
    category: email.category
  }
  
  const priorityResult = calculatePriority(emailContent)
  const priorityBreakdown = priorityResult.appliedRules
    .filter(rule => rule.matched)
    .map(rule => ({
      ruleName: rule.ruleName,
      score: rule.score,
      description: rule.reason.split(': ')[1]
    }))
  
  return {
    ...email,
    priority: priorityResult.priority,
    priorityScore: priorityResult.totalScore,
    priorityReasons: priorityResult.reasons,
    priorityBreakdown,
    attachments: email.attachments || [],
    draftReply: email.draftReply || '',
    opportunityExplanation: email.opportunityExplanation || ''
  }
}

export function getDashboardStats() {
  const emails = getMockEmails()
  
  return {
    totalEmails: emails.length,
    criticalEmails: emails.filter(e => e.priority === 'Critical').length,
    highPriorityEmails: emails.filter(e => e.priority === 'High').length,
    businessOpportunities: emails.filter(e => e.opportunityScore >= 70).length,
  }
}