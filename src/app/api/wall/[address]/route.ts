import { FetchMethod, fetchTapestry } from '@/utils/api'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params

    // Get comments for this wallet address as the contentId
    const response = await fetchTapestry({
      endpoint: 'comments',
      method: FetchMethod.GET,
      queryParams: {
        contentId: address,
      },
    })

    if (!response) {
      throw new Error('Failed to fetch wall posts')
    }

    return NextResponse.json({ comments: response.comments })
  } catch (error) {
    console.error('Error fetching wall posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wall posts' },
      { status: 500 }
    )
  }
} 