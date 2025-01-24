import { NextRequest, NextResponse } from 'next/server'
import { tapestryServer } from '@/lib/tapestry-server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: 'yikes' }, { status: 500 })
  } catch (error) {
    console.error('[Get Asset Error]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get asset' },
      { status: 500 },
    )
  }
}
