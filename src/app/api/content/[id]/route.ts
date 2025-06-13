import { contentServer } from '@/utils/content-server'
import { dedupContent } from '@/utils/redis-dedup'
import { NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const { searchParams } = new URL(request.url)
  const requestingProfileId = searchParams.get('requestingProfileId')
  const params = await context.params
  const { id } = params

  console.log(
    `[API] Fetching content for id: ${id}, requestingProfileId: ${
      requestingProfileId || 'none'
    }`
  )

  try {
    // Use deduplication to prevent concurrent requests for the same content
    const content = await dedupContent(
      id,
      requestingProfileId || undefined,
      async () => {
        const result = await contentServer.getContentById(
          id,
          requestingProfileId || undefined
        )
        
        if (!result) {
          throw new Error('Content not found')
        }
        
        return result
      }
    )

    console.log(`[API] Successfully fetched content for id: ${id}`)
    return NextResponse.json(content, {
      headers: {
        // Add cache headers for browser caching
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error: any) {
    if (error.message === 'Content not found') {
      console.error(`[API] Content not found for id: ${id}`)
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }
    
    console.error(`[API] Error fetching content for id: ${id}:`, error)
    console.error(`[API] Error stack:`, error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const params = await context.params
  const { id } = params
  try {
    const body = await request.json()
    const { properties } = body

    if (!properties || !Array.isArray(properties)) {
      return NextResponse.json(
        { error: 'Properties array is required' },
        { status: 400 }
      )
    }

    const content = await contentServer.updateContent(id, properties)
    return NextResponse.json(content)
  } catch (error: any) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update content' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const params = await context.params
  const { id } = params
  try {
    await contentServer.deleteContent(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete content' },
      { status: 500 }
    )
  }
}
