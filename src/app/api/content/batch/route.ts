import { contentServer } from '@/lib/content-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'Array of content IDs is required' },
        { status: 400 }
      )
    }

    if (ids.length > 20) {
      return NextResponse.json(
        { error: 'Maximum of 20 content IDs allowed' },
        { status: 400 }
      )
    }

    const contents = await contentServer.getBatchContents(ids)
    return NextResponse.json(contents)
  } catch (error: any) {
    console.error('Error fetching batch contents:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch batch contents' },
      { status: 500 }
    )
  }
}
