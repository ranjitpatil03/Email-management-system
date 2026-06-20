import { NextResponse } from 'next/server'

export async function GET() {
  const emailUser = process.env.EMAIL_USER || ''

  return NextResponse.json({
    emailUser,
    configured: !!emailUser,
  })
}