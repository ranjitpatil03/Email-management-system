import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seed script is disabled to prevent demo data from being inserted.')
  console.log('Real Gmail emails are synced via the Gmail IMAP integration.')
  console.log('Skipping seed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })