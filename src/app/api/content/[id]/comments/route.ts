import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params
    const requestingProfileId = request.nextUrl.searchParams.get(
      'requestingProfileId'
    )
    const page = request.nextUrl.searchParams.get('page')
    const pageSize = request.nextUrl.searchParams.get('pageSize')

    // Use the richer endpoint: /comments/{contentId}
    const qs = new URLSearchParams()
    if (requestingProfileId) qs.set('requestingProfileId', requestingProfileId)
    if (page) qs.set('page', page)
    if (pageSize) qs.set('pageSize', pageSize)

    let tapestryResponse: any
    try {
      tapestryResponse = await fetchTapestryServer<any>({
        endpoint: `comments/${id}${qs.toString() ? `?${qs.toString()}` : ''}`,
        method: FetchMethod.GET,
      })
    } catch (err) {
      // Fallback for older API deployments: /comments?contentId=
      tapestryResponse = await fetchTapestryServer<any>({
        endpoint: `comments?contentId=${id}${
          qs.toString() ? `&${qs.toString()}` : ''
        }`,
        method: FetchMethod.GET,
      })
    }

    // Normalize to a lean shape expected by the UI hook
    const normalized = {
      comments: (tapestryResponse?.comments || []).map((item: any) => ({
        id: item?.comment?.id,
        text: item?.comment?.text,
        created_at: item?.comment?.created_at,
        profile: {
          username: item?.author?.username,
          image: item?.author?.image ?? undefined,
        },
        socialCounts: item?.socialCounts,
        requestingProfileSocialInfo: item?.requestingProfileSocialInfo,
      })),
      page: tapestryResponse?.page,
      pageSize: tapestryResponse?.pageSize,
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('[Get Content Comments Error]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content comments' },
      { status: 500 }
    )
  }
}
