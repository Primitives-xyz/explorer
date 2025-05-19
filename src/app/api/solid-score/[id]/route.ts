import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const response = await fetchTapestry({
      endpoint: `profiles/${id}/solid-score`,
      method: FetchMethod.GET,
    })

    return NextResponse.json(response)
  } catch (err) {
    console.error('[SOLID SCORE ERROR]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
