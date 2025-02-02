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
  // If it's not a TRANSFER type, it's not spam
  if (tx.type !== 'TRANSFER') return false

  // If there are no native transfers, it's not spam
  if (!tx.nativeTransfers || tx.nativeTransfers.length === 0) return false

  // For transfers, check if it's a mass airdrop of tiny amounts
  if (tx.nativeTransfers.length > 15) {
    // Check if all transfers are tiny amounts (less than 0.00001 SOL)
    const allTinyTransfers = tx.nativeTransfers.every(
      (transfer: any) => Math.abs(transfer.amount / 1e9) < 0.00001,
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
        return {
          ...details,
          signature: tx.signature,
          success: !tx.transactionError,
          accountsInvolved:
            tx.accountData?.map((acc: any) => acc.account) || [],
          tokenTransfers: getTokenTransfers(tx),
          programsInvolved: getProgramInteractions(tx),
          events: parseEvents(tx),
          balanceChanges: getBalanceChanges(tx),
          parsedInstructions,
        }
      } catch (error) {
        console.error('Error parsing transaction:', error)
        return null
      }
    }),
  ).then((results) => results.filter(Boolean))
}

function getTokenTransfers(tx: any) {
  return (tx.tokenTransfers || []).map((transfer: any) => ({
    tokenMint: transfer.mint || transfer.tokenMint || '',
    from: transfer.fromUserAccount || '',
    to: transfer.toUserAccount || '',
    amount: transfer.tokenAmount || 0,
  }))
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
    console.error('Helius API key is not configured')
    return NextResponse.json(
      { error: 'Helius API key not configured' },
      { status: 500 },
    )
  }

  const url = before
    ? `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&before=${before}&limit=5`
    : `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=5`

  try {
    console.log('Fetching transactions from Helius for address:', address)
    const response = await fetch(url)
    if (!response.ok) {
      console.error('Helius API error:', response.status, await response.text())
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Handle empty response from Helius
    if (!Array.isArray(data) || data.length === 0) {
      console.log('No transactions returned from Helius')
      return NextResponse.json([])
    }

    console.log('Parsing', data.length, 'transactions')
    const parsedData = await parseTransactions(data)
    console.log('Parsed transaction count:', parsedData?.length || 0)

    // Handle case where all transactions were filtered out
    if (!parsedData || parsedData.length === 0) {
      console.log('All transactions were filtered out')
      return NextResponse.json([])
    }

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    )
  }
}
