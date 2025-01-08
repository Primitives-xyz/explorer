import { NextRequest, NextResponse } from 'next/server'
import {
  SolanaFMParser,
  ParserType,
  checkIfInstructionParser,
} from '@solanafm/explorer-kit'
import { getProgramIdl } from '@solanafm/explorer-kit-idls'

// Helper function to categorize transaction types
function categorizeTransaction(tx: any) {
  const type = tx.type
  const source = tx.source
  const description = tx.description
  const fee = tx.fee / 1e9 // Convert lamports to SOL
  const timestamp = tx.timestamp
    ? new Date(tx.timestamp * 1000).toISOString()
    : new Date().toISOString()

  // Get native transfers
  const transfers =
    tx.nativeTransfers?.map((transfer: any) => ({
      from: transfer.fromUserAccount,
      to: transfer.toUserAccount,
      amount: transfer.amount / 1e9, // Convert lamports to SOL
    })) || []

  return {
    type,
    source,
    description,
    fee,
    timestamp,
    transfers,
  }
}

// Helper function to detect spam/dust transactions
function isSpamTransaction(tx: any) {
  // Check if it's a multi-transfer with tiny amounts
  if (
    tx.type === 'TRANSFER' &&
    tx.nativeTransfers &&
    tx.nativeTransfers.length > 3
  ) {
    // Check if all transfers are tiny amounts (less than 0.001 SOL)
    const allTinyTransfers = tx.nativeTransfers.every(
      (transfer: any) => Math.abs(transfer.amount / 1e9) < 0.001,
    )
    if (allTinyTransfers) return true
  }
  return false
}

// Main parsing function with SolanaFM Explorer Kit
async function parseTransactions(transactions: any[]) {
  // Filter out spam transactions
  const filteredTransactions = transactions.filter(
    (tx) => !isSpamTransaction(tx),
  )

  return Promise.all(
    filteredTransactions.map(async (tx) => {
      try {
        const details = categorizeTransaction(tx)

        // Parse instructions using SolanaFM Explorer Kit
        const parsedInstructions = await Promise.all(
          (tx.instructions || []).map(async (ix: any) => {
            try {
              const idlItem = await getProgramIdl(ix.programId)
              if (idlItem) {
                const parser = new SolanaFMParser(idlItem, ix.programId)
                const instructionParser = parser.createParser(
                  ParserType.INSTRUCTION,
                )

                if (
                  instructionParser &&
                  checkIfInstructionParser(instructionParser)
                ) {
                  const decodedData = instructionParser.parseInstructions(
                    ix.data,
                  )
                  return {
                    ...ix,
                    decodedData,
                  }
                }
              }
              return ix
            } catch (error) {
              console.error(
                `Error parsing instruction for program ${ix.programId}:`,
                error,
              )
              return ix
            }
          }),
        )

        // Add additional transaction metadata
        const [tokenTransfers, programsInvolved, events, balanceChanges] = await Promise.all([
          getTokenTransfers(tx),
          getProgramInteractions(tx),
          parseEvents(tx),
          getBalanceChanges(tx)
        ])

        return {
          ...details,
          signature: tx.signature,
          success: !tx.transactionError,
          accountsInvolved:
            tx.accountData?.map((acc: any) => acc.account) || [],
          tokenTransfers,
          programsInvolved,
          events,
          balanceChanges,
          parsedInstructions,
        }
      } catch (error) {
        console.error('Error parsing transaction:', error)
        return null
      }
    }),
  ).then((results) => results.filter(Boolean))
}

async function getTokenTransfers(tx: any) {
  if (!tx.tokenTransfers?.length) return []
  
  const transfers = tx.tokenTransfers || []
  const uniqueMints = new Set(transfers.map((t: any) => t.mint || t.tokenMint))
  const metadataPromises = Array.from(uniqueMints).map(async (mint: unknown) => {
    if (typeof mint !== 'string') return null
    if (!mint) return null
    try {
      const response = await fetch(`${process.env.RPC_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'my-id',
          method: 'getAsset',
          params: { id: mint }
        })
      })
      
      if (!response.ok) return null
      const data = await response.json()
      if (data.error) return null
      
      return {
        mint,
        metadata: {
          name: data.result?.content?.metadata?.name || 'Unknown Token',
          symbol: data.result?.content?.metadata?.symbol || '',
          decimals: data.result?.token_info?.decimals,
          imageUrl: data.result?.content?.links?.image || data.result?.content?.files?.[0]?.cdn_uri || null,
          tokenStandard: data.result?.interface || data.result?.content?.metadata?.token_standard,
          price_info: data.result?.token_info?.price_info,
          supply: data.result?.token_info?.supply
        }
      }
    } catch (error) {
      console.error(`Error fetching metadata for token ${mint}:`, error)
      return null
    }
  })
  
  const metadataResults = await Promise.all(metadataPromises)
  const metadataMap = new Map(
    metadataResults
      .filter(Boolean)
      .map(result => [result!.mint, result!.metadata])
  )
  
  return transfers.map((transfer: any) => {
    const mint = transfer.mint || transfer.tokenMint || ''
    return {
      tokenMint: mint,
      from: transfer.fromUserAccount || '',
      to: transfer.toUserAccount || '',
      amount: transfer.tokenAmount || 0,
      metadata: metadataMap.get(mint) || null
    }
  })
}

function getProgramInteractions(tx: any) {
  const programs = new Set<string>()

  // Track main program calls
  tx.instructions?.forEach((ix: any) => {
    if (ix.programId) {
      programs.add(ix.programId)
    }
  })

  // Track inner instructions
  tx.instructions?.forEach((ix: any) => {
    ix.innerInstructions?.forEach((inner: any) => {
      if (inner.programId) {
        programs.add(inner.programId)
      }
    })
  })

  return Array.from(programs)
}

function parseEvents(tx: any) {
  const events: any[] = []

  // Parse compressed NFT events
  if (tx.events?.compressed) {
    events.push(
      ...tx.events.compressed.map((event: any) => ({
        type: event.type,
        assetId: event.assetId,
        newOwner: event.newLeafOwner,
        metadata: event.metadata,
      })),
    )
  }

  return events
}

function getBalanceChanges(tx: any) {
  return (tx.accountData || []).reduce((changes: any, account: any) => {
    if (account.nativeBalanceChange !== 0) {
      changes[account.account] = account.nativeBalanceChange / 1e9
    }
    return changes
  }, {})
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const before = searchParams.get('before')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Helius API key not configured' },
      { status: 500 },
    )
  }

  const url = before
    ? `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&until=${before}&limit=14`
    : `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=14`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    const parsedData = await parseTransactions(data)
    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    )
  }
}
