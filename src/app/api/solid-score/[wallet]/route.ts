import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ wallet: string }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { wallet } = await context.params

  if (!wallet) {
    return NextResponse.json(
      { error: 'Wallet address is missing' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `https://score.solana.id/api/solid-score/address/${wallet}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.SOLANA_ID_API_KEY || '',
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

// import { fetchTapestry } from '@/components/tapestry/api/fetch-tapestry'
// import { FetchMethod } from '@/utils/api'
// import { NextRequest, NextResponse } from 'next/server'

// type RouteContext = {
//   params: Promise<{ wallet: string }>
// }

// export async function GET(_req: NextRequest, context: RouteContext) {
//   try {
//     const params = await context.params
//     const { wallet } = params

//     if (!wallet) {
//       return NextResponse.json(
//         { error: 'Wallet address is required' },
//         { status: 400 }
//       )
//     }

//     const response = await fetchTapestry({
//       endpoint: `profiles/${wallet}/solid-score`,
//       method: FetchMethod.GET,
//     })

//     console.log({ response })

//     return NextResponse.json(response)
//   } catch (err) {
//     console.error('[SOLID SCORE ERROR]', err)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }
