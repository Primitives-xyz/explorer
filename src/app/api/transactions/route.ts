import {
  ParserType,
  SolanaFMParser,
  checkIfInstructionParser,
} from '@solanafm/explorer-kit'
import { getProgramIdl } from '@solanafm/explorer-kit-idls'
import { NextRequest, NextResponse } from 'next/server'

const TRANSACTIONS_PER_PAGE = 20

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
      (transfer: any) => Math.abs(transfer.amount / 1e9) < 0.00001
    )
    if (allTinyTransfers) return true
  }

  return false
}

// Helper function to enrich transaction with extra fields
function enrichTransaction(tx: any, address: string) {
  // Add new fields but keep all original fields
  return {
    ...tx,
    sourceWallet: address,
    // Add any other enrichment fields here
    // e.g. you can add parsedInstructions, but do not run heavy parsing by default
    // parsedInstructions: [], // Optionally, add this on a case-by-case basis
    // Add any other computed fields as needed
    // For example, you can add spam flag if you want
    isSpam: isSpamTransaction(tx),
  }
}

// Main parsing function with SolanaFM Explorer Kit
async function parseTransactions(transactions: any[], address: string) {
  // Filter out spam transactions
  const filteredTransactions = transactions.filter(
    (tx) => !isSpamTransaction(tx)
  )

  // Enrich each transaction but keep all original fields
  return filteredTransactions.map((tx) => enrichTransaction(tx, address))
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
      }))
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
  // Get type(s) - can be comma-separated list
  const type = searchParams.get('type')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Helius API key not configured' },
      { status: 500 }
    )
  }

  // Build URL exactly as per Helius docs
  let url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=${TRANSACTIONS_PER_PAGE}`

  // Add type parameter if provided (Helius accepts comma-separated types)
  if (type) {
    url += `&type=${type}`
  }

  // Add before parameter if provided for pagination
  if (before) {
    url += `&before=${before}`
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Handle empty response
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json([])
    }

    const enrichedData = await parseTransactions(data, address)
    return NextResponse.json(enrichedData)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
