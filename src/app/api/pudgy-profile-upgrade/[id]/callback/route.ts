import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const requestBody = await _req.json()
    const txSignature = requestBody.txSignature
    const profileGradient = requestBody.profileGradient
    const txId = requestBody.txId

    if (!txSignature || !txId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const response = await fetchTapestry({
      endpoint: `profiles/${id}/pudgy/upgrade/callback`,
      method: FetchMethod.POST,
      body: {
        txSignature,
        profileGradient,
        txId,
      },
    })

    return NextResponse.json(response)
  } catch (err) {
    console.error('[PUDGY PROFILE UPGRADE ERROR]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
