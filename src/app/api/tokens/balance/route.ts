import { dedupBalance } from '@/utils/redis-dedup'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { NextResponse } from 'next/server'

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
        { status: 400 }
      )
    }

    // Use deduplication for wallet+mint queries
    if (walletAddress && mintAddress) {
      const balanceData = await dedupBalance(
        walletAddress,
        mintAddress,
        async () => {
          const connection = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' })
          const tokenAccountToQuery = await getAssociatedTokenAddress(
            new PublicKey(mintAddress),
            new PublicKey(walletAddress)
          )

          try {
            const balance = await connection.getTokenAccountBalance(
              tokenAccountToQuery
            )
            return {
              amount: balance.value.amount,
              decimals: balance.value.decimals,
              uiAmount: balance.value.uiAmount,
              uiAmountString: balance.value.uiAmountString,
            }
          } catch (balanceError: any) {
            if (balanceError?.message?.includes('could not find account')) {
              return {
                amount: '0',
                decimals: 0,
                uiAmount: 0,
                uiAmountString: '0',
              }
            }
            throw balanceError
          }
        }
      )

      return NextResponse.json(
        { balance: balanceData },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
          },
        }
      )
    }

    // For tokenAccount queries (less common), use original logic
    const connection = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' })
    const tokenAccountToQuery = new PublicKey(tokenAccount!)

    try {
      const balance = await connection.getTokenAccountBalance(
        tokenAccountToQuery
      )

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
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
          },
        }
      )
    } catch (balanceError: any) {
      if (balanceError?.message?.includes('could not find account')) {
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
          }
        )
      }
      throw balanceError
    }
  } catch (error) {
    console.error('Error fetching token balance:', error)
    return NextResponse.json(
      { error: `Failed to fetch token balance: ${error}` },
      { status: 500 }
    )
  }
}
