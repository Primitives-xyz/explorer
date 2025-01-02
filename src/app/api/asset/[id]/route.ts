import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  if (!process.env.RPC_URL) {
    return NextResponse.json(
      { error: 'RPC URL is not configured' },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(process.env.RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAsset',
        params: {
          id: id,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || 'RPC error occurred')
    }

    return NextResponse.json(data.result)
  } catch (error) {
    console.error('Error fetching asset:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch asset'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
