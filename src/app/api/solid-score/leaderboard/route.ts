import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { FetchMethod } from '@/utils/api'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetchTapestry({
      endpoint: `profiles/solid-score/leaderboard`,
      method: FetchMethod.GET,
    })

    return NextResponse.json(response)
  } catch (err) {
    console.error('[SOLID SCORE LEADERBOARD ERROR]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
