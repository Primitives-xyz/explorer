import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { wallet: string } }
) {
  const { wallet } = params

  try {
    const response = await fetch(
      `https://score.solana.id/api/solid-score/address/${wallet}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'llJkpcwT0BVs9Hi0x64ikxlMP8WID9JzNCUk9H',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch SOLID score' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[SOLID SCORE ERROR]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
