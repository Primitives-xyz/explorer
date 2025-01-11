import { FetchMethod, fetchTapestry } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type Context = {
  params: {
    address: string
  }
}

export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const { address } = context.params

    // Get comments for this wallet address as the contentId
    const response = await fetchTapestry({
      endpoint: `comments?contentId=${address}`,
      method: FetchMethod.GET,
    })

    if (!response) {
      throw new Error('Failed to fetch wall posts')
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching wall posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wall posts' },
      { status: 500 }
    )
  }
} 