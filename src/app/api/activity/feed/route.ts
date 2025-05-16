import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  const includeExternalNamespaces = searchParams.get(
    'includeExternalNamespaces'
  )

  const queryParams: Record<string, string | number> = {}

  if (username) {
    queryParams.username = username
  }

  if (includeExternalNamespaces) {
    queryParams.includeExternalNamespaces = includeExternalNamespaces
  }

  try {
    const response = await fetchTapestry({
      endpoint: 'activity/feed',
      method: FetchMethod.GET,
      queryParams,
    })

    console.log({ response })

    return NextResponse.json(response)
  } catch (err) {
    console.error('Activity Feed Error', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
