import { NextRequest, NextResponse } from 'next/server'

const JUP_PRICE_V3 = 'https://lite-api.jup.ag/price/v3'

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ids = searchParams.get('ids') || ''

  if (!ids) {
    return NextResponse.json(
      { message: 'Missing ids query param' },
      { status: 400 }
    )
  }

  const idList = ids
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (idList.length === 0) {
    return NextResponse.json(
      { message: 'No valid ids provided' },
      { status: 400 }
    )
  }

  // Jupiter v3 limit is 50 ids per request; chunk and merge
  const chunks = chunkArray(idList, 50)

  try {
    const results = await Promise.all(
      chunks.map(async (chunk) => {
        const upstreamUrl = `${JUP_PRICE_V3}?ids=${encodeURIComponent(
          chunk.join(',')
        )}`
        const res = await fetch(upstreamUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            accept: 'application/json',
          },
        })
        const text = await res.text()
        try {
          const json = text ? JSON.parse(text) : {}
          return { ok: res.ok, status: res.status, json }
        } catch (e) {
          return { ok: false, status: res.status, json: {} as any }
        }
      })
    )

    // Merge all JSON objects into one
    const merged: Record<string, any> = {}
    for (const r of results) {
      if (r && r.json && typeof r.json === 'object') {
        Object.assign(merged, r.json)
      }
    }

    // If at least one succeeded, return 200 with merged; otherwise return 502
    const anyOk = results.some((r) => r.ok)
    return NextResponse.json(merged, { status: anyOk ? 200 : 502 })
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch upstream', error: String(error) },
      { status: 502 }
    )
  }
}
