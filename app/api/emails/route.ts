import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const priority = searchParams.get('priority') || ''
    const category = searchParams.get('category') || ''
    const opportunityLevel = searchParams.get('opportunityLevel') || ''
    
    // Build filter conditions
    const where: any = {}
    
    if (search) {
      where.OR = [
        { senderEmail: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (priority) {
      where.priority = priority
    }
    
    if (category) {
      where.category = category
    }
    
    if (opportunityLevel) {
      const [level, range] = opportunityLevel.split(' ')
      if (level === 'High') {
        where.opportunityScore = { gte: 70 }
      } else if (level === 'Medium') {
        where.opportunityScore = { gte: 40, lt: 70 }
      } else if (level === 'Low') {
        where.opportunityScore = { lt: 40 }
      }
    }
    
    // Fetch emails with attachments
    const emails = await prisma.email.findMany({
      where,
      include: {
        attachments: true,
      },
      orderBy: {
        receivedAt: 'desc',
      },
    })
    
    // Transform data for frontend
    const transformedEmails = emails.map(email => ({
      id: email.id,
      sender: email.senderEmail,
      subject: email.subject,
      content: email.content,
      summary: email.aiSummary || '',
      category: email.category || 'Business',
      priority: email.priority,
      opportunityScore: email.opportunityScore || 0,
      receivedDate: email.receivedAt.toISOString(),
      recommendedAction: email.recommendedAction || '',
      priorityReasons: email.priorityReasons ? JSON.parse(email.priorityReasons) : [],
      priorityScore: email.priorityScore || 0,
      priorityBreakdown: email.priorityBreakdown ? JSON.parse(email.priorityBreakdown) : [],
      attachments: email.attachments.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        size: attachment.size,
        type: attachment.type,
      })),
      draftReply: email.draftReply || '',
      opportunityExplanation: email.opportunityExplanation || '',
    }))
    
    return NextResponse.json({
      emails: transformedEmails,
      total: transformedEmails.length,
    })
    
  } catch (error) {
    console.error('Error fetching emails:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create email in database
    const email = await prisma.email.create({
      data: {
        senderEmail: body.sender,
        senderName: body.sender.split('@')[0].replace('.', ' '),
        subject: body.subject,
        content: body.content,
        aiSummary: body.summary || '',
        category: body.category || 'Business',
        priority: body.priority || 'Medium',
        opportunityScore: body.opportunityScore || 0,
        receivedAt: new Date(body.receivedDate || new Date()),
        recommendedAction: body.recommendedAction || '',
        priorityReasons: JSON.stringify(body.priorityReasons || []),
        priorityScore: body.priorityScore || 0,
        priorityBreakdown: JSON.stringify(body.priorityBreakdown || []),
        draftReply: body.draftReply || '',
        opportunityExplanation: body.opportunityExplanation || '',
        emailProvider: 'api',
      },
    })
    
    return NextResponse.json(email, { status: 201 })
    
  } catch (error) {
    console.error('Error creating email:', error)
    return NextResponse.json(
      { error: 'Failed to create email' },
      { status: 500 }
    )
  }
}