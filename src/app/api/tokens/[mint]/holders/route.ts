import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ mint: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { mint } = params
    const searchParams = req.nextUrl.searchParams
    const requestorId = searchParams.get('requestorId')
    const page = searchParams.get('page') || '1'
    const pageSize = searchParams.get('pageSize') || '1000'

    if (!mint) {
      return NextResponse.json(
        { error: 'Token mint address is required' },
        { status: 400 },
      )
    }

    const response = await fetchTapestryServer({
      endpoint: `profiles/token-owners/${mint}?page=${page}&pageSize=${pageSize}${
        requestorId ? `&requestorId=${requestorId}` : ''
      }`,
      method: FetchMethod.GET,
    })

    // Transform the response to match our expected format
    return NextResponse.json({
      profiles: response.profiles || [],
      totalAmount: response.profiles?.length || 0,
    })
  } catch (error: any) {
    console.error('[Token Holders API Error]:', {
      error: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token holders' },
      { status: 500 },
    )
  }
}
