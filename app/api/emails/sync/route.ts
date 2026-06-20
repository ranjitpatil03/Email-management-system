import { NextRequest, NextResponse } from 'next/server'
import { syncGmailEmails, testGmailConnection } from '../../../lib/gmailSync'

export async function POST(request: NextRequest) {
  try {
    // Check if Gmail credentials are configured
    const testResult = await testGmailConnection()
    if (!testResult.success) {
      console.error("TEST CONNECTION FAILED:", testResult)
        
      return NextResponse.json(
	{ 
          success: false, 
          error: testResult.error || "Unknown Gmail error"
          
        },
        { status: 400 }
      )
    }

    // Start sync
    const syncResult = await syncGmailEmails()
    
    if (syncResult.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${syncResult.count} emails from Gmail`,
        count: syncResult.count,
        lastSyncTime: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: syncResult.error || 'Failed to sync emails',
          count: syncResult.count
        },
        { status: 500 }
      )
    }
    
  } catch (error: any) {
    console.error('API sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error during sync'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test Gmail connection
    const testResult = await testGmailConnection()
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Gmail connection test successful',
        configured: true
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Gmail connection test failed',
        error: testResult.error,
        configured: false
      })
    }
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}