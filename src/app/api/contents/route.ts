import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const namespace = searchParams.get('namespace')
  const pageSize = searchParams.get('pageSize')
  const page = searchParams.get('page')
  const orderByDirection = searchParams.get('orderByDirection')
  const orderByField = searchParams.get('orderByField')
  const queryParams: Record<string, string> = {}

  if (namespace) {
    queryParams.namespace = namespace
  }

  if (pageSize) {
    queryParams.pageSize = pageSize
  }

  if (page) {
    queryParams.page = page
  }

  if (orderByField) {
    queryParams.orderByField = orderByField
  }

  if (orderByDirection) {
    queryParams.orderByDirection = orderByDirection
  }

  try {
    const response = await fetchTapestry({
      endpoint: 'contents',
      tags: ['contents'],
      queryParams,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get content' },
      { status: 500 }
    )
  }
}
