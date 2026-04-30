'use server'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// In-memory store for WeChat QR scan states (in production, use Redis or database)
const scanStates: Record<string, { status: 'idle' | 'scanned' | 'confirmed'; session?: object }> = {}

// Set scan state (called when user scans)
export async function POST(request: NextRequest) {
  try {
    const { state, status } = await request.json()

    if (!state) {
      return NextResponse.json({ error: 'Missing state' }, { status: 400 })
    }

    scanStates[state] = { status }

    // If confirmed, store session data
    if (status === 'confirmed' && request.body) {
      const body = await request.json()
      if (body.session) {
        scanStates[state].session = body.session
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Get scan state (polled by frontend)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const state = searchParams.get('state')

  if (!state) {
    return NextResponse.json({ error: 'Missing state' }, { status: 400 })
  }

  const scanState = scanStates[state]

  if (!scanState) {
    return NextResponse.json({ status: 'idle' })
  }

  // Clean up old states (older than 5 minutes)
  const now = Date.now()
  Object.keys(scanStates).forEach(key => {
    const age = now - parseInt(key.split('_').pop() || '0')
    if (age > 5 * 60 * 1000) {
      delete scanStates[key]
    }
  })

  return NextResponse.json(scanState)
}
