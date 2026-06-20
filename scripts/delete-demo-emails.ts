import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Deleting demo/seeded emails from the database...')
  
  // Delete all emails from mock providers (not gmail)
  // This clears emails that have emailProvider = 'mock' or null/undefined (from seeds)
  // Also specifically target known demo email addresses
  
  const demoEmails = await prisma.email.findMany({
    where: {
      OR: [
        { emailProvider: 'mock' },
        { emailProvider: null },
        { senderEmail: { in: [
          'john.doe@techcorp.com',
          'support@clientplatform.com',
          'sarah.miller@venturepartners.vc',
          'newsletter@techweekly.com',
          'alex.wong@enterpriseco.com',
          'security@company.com',
          'marketing@competitor.ai',
          'legal@company.com',
          'careers@techjobs.com',
          'events@aiconference.org',
          'finance@company.com',
          'user.feedback@company.com',
          'research@university.edu',
          'api@integrationpartner.com',
          'news@techcrunch.com',
          'demo@example.com'
        ]}}
      ]
    }
  })

  console.log(`Found ${demoEmails.length} demo emails to delete.`)
  
  // Delete associated attachments first
  for (const email of demoEmails) {
    await prisma.attachment.deleteMany({
      where: { emailId: email.id }
    })
  }
  
  // Delete the demo emails
  const deleteResult = await prisma.email.deleteMany({
    where: {
      OR: [
        { emailProvider: 'mock' },
        { emailProvider: null },
        { senderEmail: { in: [
          'john.doe@techcorp.com',
          'support@clientplatform.com',
          'sarah.miller@venturepartners.vc',
          'newsletter@techweekly.com',
          'alex.wong@enterpriseco.com',
          'security@company.com',
          'marketing@competitor.ai',
          'legal@company.com',
          'careers@techjobs.com',
          'events@aiconference.org',
          'finance@company.com',
          'user.feedback@company.com',
          'research@university.edu',
          'api@integrationpartner.com',
          'news@techcrunch.com',
          'demo@example.com'
        ]}}
      ]
    }
  })

  // Also delete demo user
  await prisma.user.deleteMany({
    where: { email: 'demo@example.com' }
  })
  
  console.log(`Deleted ${deleteResult.count} demo emails.`)
  console.log('Done. Only real Gmail emails remain in the database.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })