import { NextResponse } from 'next/server'
import { contentServer } from '@/lib/content-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderByField = searchParams.get('orderByField')
  const orderByDirection = searchParams.get('orderByDirection') as
    | 'ASC'
    | 'DESC'
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  const profileId = searchParams.get('profileId')
  const requestingProfileId = searchParams.get('requestingProfileId')
  const namespace = searchParams.get('namespace')

  try {
    const contents = await contentServer.getContents({
      ...(orderByField && { orderByField }),
      ...(orderByDirection && { orderByDirection }),
      ...(page && { page: parseInt(page) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
      ...(profileId && { profileId }),
      ...(requestingProfileId && { requestingProfileId }),
      ...(namespace && { namespace }),
    })
    console.log('contents: ', contents)

    return NextResponse.json(contents)
  } catch (error: any) {
    console.error('Error fetching contents:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contents' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, profileId, relatedContentId, properties } = body

    if (!id || !profileId) {
      return NextResponse.json(
        { error: 'Missing required fields: id and profileId' },
        { status: 400 },
      )
    }

    const content = await contentServer.findOrCreateContent({
      id,
      profileId,
      relatedContentId,
      properties,
    })

    return NextResponse.json(content)
  } catch (error: any) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create content' },
      { status: 500 },
    )
  }
}
