import { NextRequest, NextResponse } from 'next/server'

interface Transfer {
  fromTokenAccount: string,
  toTokenAccount: string,
  fromUserAccount: string,
  toUserAccount: string,
  tokenAmount: number,
  mint: string,
  tokenStandard: string
}

interface TransactionHistoryData {
  description: string
  type: string
  source: string
  fee: number
  feePayer: string
  signature: string
  slot: number
  timestamp: number
  tokenTransfers: Transfer[]
  nativeTransfers: any
  accountData: any
  transactionError: any
  instructions: any
  events: any
}

interface ParsedTransactionHistoryData {
  description: string
  source: string
  signature: string
  timestamp: number
  baseTokenMint: string
  baseTokenAmount: number
  quoteTokenMint: string
  quoteTokenAmount: number
}

const TRANSACTIONS_PER_PAGE = 20

export async function GET(
  request: NextRequest
) {
  const apiKey = process.env.HELIUS_API_KEY
  const searchParams = request.nextUrl.searchParams
  const walletAddress = searchParams.get('address')
  const mint = searchParams.get('mint')
  const before = searchParams.get('before')
  const type = searchParams.get('type')

  if (!walletAddress) {
    return NextResponse.json({
      error: "Wallet Address is required",
      status: 400
    })
  }

  if (!mint) {
    return NextResponse.json({
      error: "TokenMint Address is required",
      status: 400
    })
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'Helius API Key is not configured',
        status: 500
      }
    )
  }

  let url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=${TRANSACTIONS_PER_PAGE}`

  if (type) url += `&type=${type}`
  if (before) url += `&before=${before}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json({
        error: "Http Error",
        status: response.status
      })
    }

    const data = await response.json()
    console.log("data:", JSON.stringify(data[0], null, 3))

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json([])
    }

    const parsedData = parseTransactions(data, mint, walletAddress)

    if (!parsedData) {
      return NextResponse.json(
        {
          history: [],
          status: 200
        }
      )
    }

    return NextResponse.json({
      history: parsedData,
      status: 200
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

function parseTransactions(datas: TransactionHistoryData[], tokenMint: string, walletAddress: string) {
  try {
    const parsedData = datas.map((data) => {
      const description = data.description
      const source = data.source
      const signature = data.signature
      const timestamp = data.timestamp

      const tokenTransfers = data.tokenTransfers
      const outboundTransfers = tokenTransfers.filter(tx => tx.fromUserAccount === walletAddress)
      const inboundTransfers = tokenTransfers.filter(tx => tx.toUserAccount === walletAddress)

      const transferPairs: { sent: Transfer; received: Transfer }[] = []

      for (const sent of outboundTransfers) {
        const received = inboundTransfers.find(rx => rx.fromUserAccount === sent.toUserAccount)
        if (received) {
          transferPairs.push({ sent, received });
        }
      }

      if (transferPairs.length) {
        const baseTokenAmount = transferPairs[0].sent.tokenAmount
        const baseTokenMint = transferPairs[0].sent.mint
        const quoteTokenAmount = transferPairs[0].received.tokenAmount
        const quoteTokenMint = transferPairs[0].received.mint

        return {
          description,
          source,
          signature,
          timestamp,
          baseTokenAmount,
          baseTokenMint,
          quoteTokenAmount,
          quoteTokenMint,
        }
      }
    }).filter((data) => (data && (data.baseTokenMint === tokenMint || data.quoteTokenMint === tokenMint)))

    return parsedData
  } catch (error) {
    console.log("Error in parsed data:", error)
    return []
  }
}
