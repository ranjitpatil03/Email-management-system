import { ImapFlow } from 'imapflow'
import { PrismaClient } from '@prisma/client'
import { calculatePriority } from './rulesEngine'

const prisma = new PrismaClient()

interface GmailEmail {
  messageId: string
  sender: string
  subject: string
  receivedDate: Date
  body: string
  attachments: Array<{
    filename: string
    contentType: string
    size: number
  }>
}

export async function syncGmailEmails(): Promise<{ success: boolean; count: number; error?: string }> {
  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_APP_PASSWORD

  console.log("EMAIL_USER:", process.env.EMAIL_USER)
  console.log("APP PASSWORD LENGTH:", process.env.EMAIL_APP_PASSWORD?.length)

  if (!emailUser || !emailPassword) {
    return {
      success: false,
      error: 'Gmail credentials not configured'
    }
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPassword
    },
    logger: false
  })

	
  try {
    // Connect to Gmail
    await client.connect()
    console.log('Connected to Gmail IMAP')

    // Select inbox
    const lock = await client.getMailboxLock('INBOX')
    try {
      // Search for emails from the last 15 days
      const messages = []
      const fifteenDaysAgo = new Date()
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
      fifteenDaysAgo.setHours(0, 0, 0, 0)

      console.log('Searching emails newer than:', fifteenDaysAgo.toISOString().split('T')[0])

      // Use IMAP SEARCH to find UIDs of messages since the cutoff date
      const searchResult = await client.search({ since: fifteenDaysAgo })
      const matchingUids: number[] = searchResult || []
      console.log('Found matching emails:', matchingUids.length)

      if (matchingUids.length > 0) {
        for await (const message of client.fetch(matchingUids, {
          envelope: true,
          source: true,
          bodyStructure: true
        })) {
          messages.push(message)
        }
      }

      console.log(`Fetched ${messages.length} emails from Gmail`)

      let savedCount = 0
      
      // Process each email
      for (const message of messages) {
        try {
          // Extract email data
          const envelope = message.envelope
          const source = message.source ? message.source.toString('utf-8') : ''
          const emailDate = new Date(envelope?.date || Date.now())

          const fifteenDaysAgo = new Date()
          fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

          if (emailDate < fifteenDaysAgo) {
            continue
          }

          // Extract message ID
          let messageId = envelope?.messageId || `msg-${Date.now()}-${Math.random()}`
          if (source) {
            const messageIdMatch = source.match(/Message-ID:\s*<([^>]+)>/i)
            if (messageIdMatch) {
              messageId = messageIdMatch[1]
            }
          }
          
          // Check if email already exists in database
          const existingEmail = await prisma.email.findFirst({
            where: {
              OR: [
                { externalId: messageId },
                { 
                  AND: [
                    { senderEmail: envelope?.from?.[0]?.address || 'unknown@example.com' },
                    { subject: envelope?.subject || 'No Subject' },
                    { receivedAt: new Date(envelope?.date || Date.now()) }
                  ]
                }
              ]
            }
          })

          if (existingEmail) {
            console.log(`Email already exists: ${envelope?.subject}`)
            continue
          }

          // Extract plain text body
          let body = ''
          const bodyStructure = message.bodyStructure as any
          if (source) {
            // Simple extraction: get everything between double line breaks
            const lines = source.split('\r\n\r\n')
            if (lines.length > 1) {
              body = lines.slice(1).join('\r\n\r\n').substring(0, 5000)
            } else {
              body = source.substring(0, 1000)
            }
          }

          // Extract sender
          const sender = envelope?.from?.[0]?.address || 'unknown@example.com'
          const senderName = envelope?.from?.[0]?.name || sender.split('@')[0]

          // Extract attachments metadata
          const attachments: Array<{ filename: string; contentType: string; size: number }> = []
          if (bodyStructure?.childNodes) {
            const childNodes = bodyStructure.childNodes as any[]
            for (const child of childNodes) {
              if (child.disposition?.type === 'attachment' || child.disposition?.type === 'inline') {
                const filename = child.disposition?.params?.filename || child.parameters?.name || `attachment-${Date.now()}`
                const contentType = child.type && child.subtype ? `${child.type}/${child.subtype}` : 'application/octet-stream'
                const size = child.size || 0
                
                attachments.push({ filename, contentType, size })
              }
            }
          }

          // Apply rules engine
          const emailContent = {
            sender,
            subject: envelope?.subject || 'No Subject',
            content: body,
            category: 'Business' // Default category, will be refined later
          }

          const priorityResult = calculatePriority(emailContent)
          
          // Generate opportunity score (mock for now - could be enhanced)
          let opportunityScore = 0
          const opportunityKeywords = ['opportunity', 'partnership', 'investment', 'collaboration', 'deal', 'proposal']
          const textForAnalysis = `${envelope?.subject || ''} ${body}`.toLowerCase()
          
          if (opportunityKeywords.some(keyword => textForAnalysis.includes(keyword))) {
            opportunityScore = Math.floor(Math.random() * 30) + 50 // 50-80% for emails with opportunity keywords
          } else if (priorityResult.totalScore >= 60) {
            opportunityScore = Math.floor(Math.random() * 20) + 30 // 30-50% for high priority emails
          } else {
            opportunityScore = Math.floor(Math.random() * 20) // 0-20% for others
          }

          // Create AI summary (mock for now)
          const aiSummary = `Email from ${senderName} about "${envelope?.subject?.substring(0, 50)}...". `
          + `Priority: ${priorityResult.priority} (Score: ${priorityResult.totalScore}). `
          + `Contains ${attachments.length} attachment(s).`

          // Recommended action based on priority
          let recommendedAction = ''
          if (priorityResult.priority === 'Critical') {
            recommendedAction = 'Respond immediately. Escalate if necessary.'
          } else if (priorityResult.priority === 'High') {
            recommendedAction = 'Respond within 24 hours.'
          } else if (priorityResult.priority === 'Medium') {
            recommendedAction = 'Respond within 3 business days.'
          } else {
            recommendedAction = 'Respond when convenient.'
          }

          // Save to database
          await prisma.email.create({
            data: {
              externalId: messageId,
              senderEmail: sender,
              senderName,
              subject: envelope?.subject || 'No Subject',
              content: body.substring(0, 10000), // Limit content size
              aiSummary,
              category: 'Business', // Will be categorized properly in future
              priority: priorityResult.priority,
              priorityScore: priorityResult.totalScore,
              priorityReasons: JSON.stringify(priorityResult.reasons),
              priorityBreakdown: JSON.stringify(priorityResult.appliedRules.filter(r => r.matched).map(r => ({
                ruleName: r.ruleName,
                score: r.score,
                description: r.reason.split(': ')[1]
              }))),
              opportunityScore,
              receivedAt: new Date(envelope?.date || Date.now()),
              recommendedAction,
              hasAttachments: attachments.length > 0,
              emailProvider: 'gmail',
            }
          })

          // Save attachments if any
          if (attachments.length > 0) {
            // In a real implementation, you would download and save attachments
            // For now, we just save metadata
            for (const attachment of attachments) {
              await prisma.attachment.create({
                data: {
                  emailId: messageId, // This will be updated after email creation
                  name: attachment.filename,
                  size: `${Math.round(attachment.size / 1024)} KB`,
                  type: attachment.contentType.split('/')[1] || 'file'
                }
              })
            }
          }

          savedCount++
          console.log(`Saved email: ${envelope?.subject}`)

        } catch (error) {
          console.error('Error processing email:', error)
          // Continue with next email
        }
      }

      return {
        success: true,
        count: savedCount
      }
    } finally {
      lock.release()
    }

  } catch (error: any) {
    console.error('Gmail sync error:', error)
    return {
      success: false,
      count: 0,
      error: error.message || 'Unknown error during Gmail sync'
    }
  } finally {
    try {
      await client.logout()
    } catch {}
  }
}

// Helper function to test connection
export async function testGmailConnection(): Promise<{ success: boolean; error?: string }> {
  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_APP_PASSWORD

  console.log("EMAIL_USER:", process.env.EMAIL_USER)
  console.log("APP PASSWORD LENGTH:", process.env.EMAIL_APP_PASSWORD?.length)

  if (!emailUser || !emailPassword) {
    return {
      success: false,
      error: 'Gmail credentials not configured'
    }
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPassword
    },
    logger: false
  })

  try {
    await client.connect()

    return {
      success: true
    }
  } catch (error: any) {
    console.error("===== GMAIL ERROR =====")
    console.error(error)
    console.error("MESSAGE:", error?.message)
    console.error("RESPONSE:", error?.response)
    console.error("AUTH FAILED:", error?.authenticationFailed)

    return {
      success: false,
      error: error?.message || 'Connection failed'
    }
  } finally {
    try {
      await client.logout()
    } catch {}
  }
}