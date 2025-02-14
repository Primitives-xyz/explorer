import { Connection, PublicKey } from '@solana/web3.js'
import { NextResponse } from 'next/server'

const RPC_ENDPOINT =
  process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mintAddress = searchParams.get('mintAddress')

    if (!mintAddress) {
      return NextResponse.json(
        { error: 'Missing mintAddress parameter' },
        { status: 400 }
      )
    }

    const connection = new Connection(RPC_ENDPOINT)
    const response = await connection.getTokenLargestAccounts(
      new PublicKey(mintAddress)
    )

    // Transform the response to include more readable values
    const holders = response.value.map((holder) => ({
      address: holder.address,
      amount: holder.amount,
      uiAmountString: holder.uiAmountString,
    }))

    // Return response with cache headers
    return NextResponse.json(
      { holders },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300', // Cache for 5 minutes with stale-while-revalidate
        },
      }
    )
  } catch (error) {
    console.error('Error fetching largest token holders:', error)
    return NextResponse.json(
      { error: `Failed to fetch largest token holders: ${error}` },
      { status: 500 }
    )
  }
}
