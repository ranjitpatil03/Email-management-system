import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    const email = await prisma.email.findUnique({
      where: { id },
      include: {
        attachments: true,
      },
    })
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }
    
    // Transform data for frontend
    const transformedEmail = {
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
    }
    
    return NextResponse.json(transformedEmail)
    
  } catch (error) {
    console.error('Error fetching email:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    
    const email = await prisma.email.update({
      where: { id },
      data: {
        subject: body.subject,
        content: body.content,
        aiSummary: body.summary,
        category: body.category,
        priority: body.priority,
        opportunityScore: body.opportunityScore,
        recommendedAction: body.recommendedAction,
        priorityReasons: JSON.stringify(body.priorityReasons || []),
        priorityScore: body.priorityScore,
        priorityBreakdown: JSON.stringify(body.priorityBreakdown || []),
        draftReply: body.draftReply,
        opportunityExplanation: body.opportunityExplanation,
        isRead: body.isRead,
        isArchived: body.isArchived,
        isStarred: body.isStarred,
      },
    })
    
    return NextResponse.json(email)
    
  } catch (error) {
    console.error('Error updating email:', error)
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Delete attachments first (due to foreign key constraint)
    await prisma.attachment.deleteMany({
      where: { emailId: id },
    })
    
    // Delete email
    await prisma.email.delete({
      where: { id },
    })
    
    return NextResponse.json(
      { message: 'Email deleted successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error deleting email:', error)
    return NextResponse.json(
      { error: 'Failed to delete email' },
      { status: 500 }
    )
  }
}