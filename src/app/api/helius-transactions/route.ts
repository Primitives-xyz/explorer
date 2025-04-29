import {
  ETransactionType,
  IExtendedHeliusTransaction,
} from '@/components/home-transactions/home-transactions.models'
import { fetchWrapper } from '@/utils/api'
import { EnrichedTransaction } from 'helius-sdk'
import { NextRequest, NextResponse } from 'next/server'

const COMMISSION_WALLET = '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'

const getTransactionType = (
  transaction: EnrichedTransaction
): ETransactionType => {
  const conditions = [
    {
      check:
        transaction.tokenTransfers?.length === 2 &&
        transaction.tokenTransfers.some(
          (t) => t.toTokenAccount === COMMISSION_WALLET && t.tokenAmount === 20
        ) &&
        transaction.tokenTransfers.some(
          (t) => t.toTokenAccount !== COMMISSION_WALLET && t.tokenAmount === 80
        ),
      type: ETransactionType.COMMENT,
    },
    { check: transaction.type === 'SWAP', type: ETransactionType.SWAP },
    {
      check:
        transaction.source === 'SYSTEM_PROGRAM' &&
        transaction.type === 'TRANSFER',
      type: ETransactionType.SOL_TRANSFER,
    },
    {
      check:
        (transaction.source === 'SOLANA_PROGRAM_LIBRARY' ||
          transaction.source === 'PHANTOM') &&
        transaction.type === 'TRANSFER',
      type: ETransactionType.SPL_TRANSFER,
    },
    {
      check:
        transaction.source === 'MAGIC_EDEN' ||
        transaction.source === 'TENSOR' ||
        transaction.type === 'COMPRESSED_NFT_MINT',
      type: ETransactionType.NFT,
    },
  ]

  return conditions.find((c) => c.check)?.type || ETransactionType.OTHER
}

function isSpamTransaction(transaction: EnrichedTransaction) {
  // If it's not a TRANSFER type, it's not spam
  if (transaction.type !== 'TRANSFER') return false

  // If there are no native transfers, it's not spam
  if (!transaction.nativeTransfers || transaction.nativeTransfers.length === 0)
    return false

  // For transfers, check if it's a mass airdrop of tiny amounts
  if (transaction.nativeTransfers.length > 15) {
    // Check if all transfers are tiny amounts (less than 0.00001 SOL)
    const allTinyTransfers = transaction.nativeTransfers.every(
      (transfer: any) => Math.abs(transfer.amount / 1e9) < 0.00001
    )
    if (allTinyTransfers) return true
  }

  return false
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const limit = searchParams.get('limit') || '20'
  // const before = searchParams.get('before')
  // Get type(s) - can be comma-separated list
  const walletAddress = searchParams.get('walletAddress')
  const type = searchParams.get('type')

  const heliusApiKey = process.env.HELIUS_API_KEY

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 }
    )
  }

  if (!heliusApiKey) {
    return NextResponse.json(
      { error: 'Helius API key not configured' },
      { status: 500 }
    )
  }

  try {
    const heliusUrl = new URL(
      `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions`
    )

    heliusUrl.searchParams.set('api-key', heliusApiKey)
    heliusUrl.searchParams.set('limit', limit)

    if (type) {
      heliusUrl.searchParams.set('type', type)
    }

    // if (before) {
    //   heliusUrl.searchParams.set('before', before)
    // }

    const heliusTransactions = await fetchWrapper<EnrichedTransaction[]>({
      endpoint: heliusUrl.toString(),
      toBackend: false,
    })

    const parsedTransactions = heliusTransactions.filter(
      (transaction) => !isSpamTransaction(transaction)
    )

    const extendedTransactions: IExtendedHeliusTransaction[] =
      parsedTransactions.map((transaction) => ({
        ...transaction,
        sourceWallet: walletAddress,
        type: getTransactionType(transaction),
      }))

    return NextResponse.json(extendedTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
