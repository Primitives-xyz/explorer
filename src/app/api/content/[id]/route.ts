import { NextResponse } from 'next/server'
import { contentServer } from '@/lib/content-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestingProfileId = searchParams.get('requestingProfileId')
  const id = request.url.split('/').pop() as string

  try {
    const content = await contentServer.getContentById(
      id,
      requestingProfileId || undefined,
    )
    return NextResponse.json(content)
  } catch (error: any) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  const id = request.url.split('/').pop() as string
  try {
    const body = await request.json()
    const { properties } = body

    if (!properties || !Array.isArray(properties)) {
      return NextResponse.json(
        { error: 'Properties array is required' },
        { status: 400 },
      )
    }

    const content = await contentServer.updateContent(id, properties)
    return NextResponse.json(content)
  } catch (error: any) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update content' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const id = request.url.split('/').pop() as string
  try {
    await contentServer.deleteContent(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete content' },
      { status: 500 },
    )
  }
}
