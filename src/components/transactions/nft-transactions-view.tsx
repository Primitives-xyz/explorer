'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import {
  CompressedNFTMintEvent,
  ExtendedTransaction,
  Transaction,
} from '@/components/tapestry/models/helius.models'
import { TransactionsHeader } from '@/components/transactions/transactions-header'
import { Badge, Card, CardContent, CardHeader } from '@/components/ui'
import {
  findNFTMintFromAccounts,
  findNFTMintFromMetaplexInstructions,
  findNFTMintFromTokenTransfers,
  getSaleAmount,
  isNFTBuyTransaction,
  normalizeTransfers,
} from '@/utils/transactions'
import { abbreviateWalletAddress } from '@/utils/utils'
import { useEffect, useMemo, useState } from 'react'

interface Props {
  transaction: Transaction
  sourceWallet: string
  primaryType: string
}

const transformToExtendedTransaction = (
  transaction: Transaction
): ExtendedTransaction => ({
  ...transaction,
  tokenTransfers:
    transaction.tokenTransfers?.map((transfer) => ({
      fromTokenAccount: transfer.fromTokenAccount,
      toTokenAccount: transfer.toTokenAccount,
      fromUserAccount: transfer.fromUserAccount,
      toUserAccount: transfer.toUserAccount,
      tokenAmount: transfer.tokenAmount,
      mint: transfer.tokenMint,
      tokenStandard: transfer.tokenStandard,
    })) || [],
  transfers:
    transaction.nativeTransfers?.map((transfer) => ({
      from: transfer.fromUserAccount,
      to: transfer.toUserAccount,
      amount: transfer.amount,
    })) || [],
  events:
    transaction.events && transaction.events.nft
      ? [] // or map to TransactionEvent[] if you want to support specific event types
      : undefined,
})

export function NftTransactionsView({ transaction, sourceWallet }: Props) {
  const extendedTransaction = transformToExtendedTransaction(transaction)
  const { profiles } = useGetProfiles({
    walletAddress: sourceWallet,
  })

  const [nftMint, setNftMint] = useState<string | null>(null)
  const [_detectionMethod, setDetectionMethod] = useState<string>('')

  const { instructions, transfers, compressedNFTMintEvent } = useMemo(() => {
    return {
      instructions:
        extendedTransaction.parsedInstructions ||
        extendedTransaction.instructions ||
        [],
      transfers: normalizeTransfers(extendedTransaction),
      compressedNFTMintEvent: extendedTransaction.events?.find(
        (event): event is CompressedNFTMintEvent =>
          event.type === 'COMPRESSED_NFT_MINT'
      ),
    }
  }, [extendedTransaction])

  const { isMint, isBuy, saleAmount } = useMemo(() => {
    const isMint =
      extendedTransaction.type === 'COMPRESSED_NFT_MINT' ||
      !!compressedNFTMintEvent
    const isBuy =
      !isMint && isNFTBuyTransaction(extendedTransaction, sourceWallet)
    const saleAmount = getSaleAmount(transfers)
    return { isMint, isBuy, saleAmount }
  }, [extendedTransaction, sourceWallet, compressedNFTMintEvent, transfers])

  useEffect(() => {
    // If we have a compressed NFT mint event, use its assetId
    if (compressedNFTMintEvent) {
      setDetectionMethod('compressed_nft_mint')
      setNftMint(compressedNFTMintEvent.assetId)
      return
    }

    // Try to find NFT mint from token transfers
    let mint = findNFTMintFromTokenTransfers(extendedTransaction)
    if (mint) {
      setDetectionMethod('token_transfer')
      setNftMint(mint)
      return
    }

    // Try to find NFT mint from Metaplex instructions
    mint = findNFTMintFromMetaplexInstructions(
      instructions,
      sourceWallet,
      extendedTransaction.accountsInvolved
    )
    if (mint) {
      setDetectionMethod('metaplex_core')
      setNftMint(mint)
      return
    }

    // Try to find NFT mint from account data
    const accounts =
      extendedTransaction.accountData?.map((acc) => acc.account) ||
      extendedTransaction.accountsInvolved ||
      []
    const accountMint = findNFTMintFromAccounts(accounts, sourceWallet)
    if (accountMint) {
      setDetectionMethod('account_data')
      setNftMint(accountMint)
    }
  }, [extendedTransaction, sourceWallet, instructions, compressedNFTMintEvent])

  return (
    <Card>
      <CardHeader>
        <TransactionsHeader
          transaction={transformToExtendedTransaction(transaction)}
          sourceWallet={sourceWallet}
          profiles={profiles}
        >
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-md">
              {isMint ? 'Minted' : isBuy ? 'Bought' : 'Sold'}
            </Badge>
            {nftMint && (
              <>
                <p>on</p>
                <Badge className="rounded-md" variant="outline">
                  {abbreviateWalletAddress({ address: nftMint })}
                </Badge>
              </>
            )}
          </div>
        </TransactionsHeader>
      </CardHeader>
      <CardContent className="space-y-4"></CardContent>
    </Card>
  )
}
