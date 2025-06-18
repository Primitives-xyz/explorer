import { IActivityGlobalResponse } from '@/components/activity-tape/activity-tape.models'
import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetchTapestry<IActivityGlobalResponse>({
      endpoint: `activity/global`,
      queryParams: {
        pageSize: 10,
      },
    })

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=760, max-age=760',
      },
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed get activity global' },
      { status: 500 }
    )
  }
}
