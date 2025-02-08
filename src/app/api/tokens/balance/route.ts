import { Connection, PublicKey } from '@solana/web3.js'
import { NextResponse } from 'next/server'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'

const RPC_ENDPOINT =
  process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenAccount = searchParams.get('tokenAccount')
    const walletAddress = searchParams.get('walletAddress')
    const mintAddress = searchParams.get('mintAddress')

    if (!tokenAccount && (!walletAddress || !mintAddress)) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters. Need either tokenAccount or both walletAddress and mintAddress',
        },
        { status: 400 },
      )
    }

    const connection = new Connection(RPC_ENDPOINT)
    let tokenAccountToQuery: PublicKey

    if (tokenAccount) {
      tokenAccountToQuery = new PublicKey(tokenAccount)
    } else {
      // Find the associated token account for the wallet and mint
      tokenAccountToQuery = await getAssociatedTokenAddress(
        new PublicKey(mintAddress!),
        new PublicKey(walletAddress!),
      )

      // Check if the token account exists
      const accountInfo = await connection.getAccountInfo(tokenAccountToQuery)
      if (!accountInfo) {
        return NextResponse.json(
          {
            balance: {
              amount: '0',
              decimals: 0,
              uiAmount: 0,
              uiAmountString: '0',
            },
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
            },
          },
        )
      }
    }

    const balance = await connection.getTokenAccountBalance(tokenAccountToQuery)

    // Return response with cache headers
    return NextResponse.json(
      {
        balance: {
          amount: balance.value.amount,
          decimals: balance.value.decimals,
          uiAmount: balance.value.uiAmount,
          uiAmountString: balance.value.uiAmountString,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60', // Cache for 1 minute with stale-while-revalidate
        },
      },
    )
  } catch (error) {
    console.error('Error fetching token balance:', error)
    return NextResponse.json(
      { error: `Failed to fetch token balance: ${error}` },
      { status: 500 },
    )
  }
}
