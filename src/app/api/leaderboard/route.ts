import { NextResponse } from 'next/server'

type Transaction = {
  type: string
  source: string
  description: string
  fee: number
  timestamp: string
  signature: string
  success: boolean
  walletAddress: string
  username: string
  from: { amount: number; token: string }
  to: { amount: number; token: string }
  accountsInvolved: string[]
}

// Set cache revalidation time to 30 seconds
export const revalidate = 30

const baseUrl = process.env.TAPESTRY_URL || 'https://api.usetapestry.dev/api/v1'
const apiKey = process.env.TAPESTRY_API_KEY

if (!apiKey) {
  throw new Error('TAPESTRY_API_KEY is not set')
}

export async function GET() {
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000 // 24 hours ago in milliseconds

  const queryParams = new URLSearchParams({
    timeStart: Math.floor(oneDayAgo / 1000).toString(), // Convert to seconds
    timeEnd: Math.floor(now / 1000).toString(), // Convert to seconds
    timeField: 'createdAt',
    page: '1',
    pageSize: '10',
  })

  const response = await fetch(`${baseUrl}/hidden/leaderboard?${queryParams}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  const apiResponse = NextResponse.json(data)

  // Set cache control headers
  apiResponse.headers.set(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=59'
  )

  return apiResponse
}
