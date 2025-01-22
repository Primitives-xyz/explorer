import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod, fetchTapestry } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, targetProfileId, text } = body

    if (!profileId || !targetProfileId || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    const response = await fetchTapestryServer({
      endpoint: 'comments',
      method: FetchMethod.POST,
      data: {
        profileId,
        targetProfileId,
        text,
      },
    })

    if (!response) {
      throw new Error('Failed to create comment')
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Create Comment Error]:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    )
  }
}
