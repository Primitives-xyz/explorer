'use client'

import {
  Transaction,
  TransactionEvent,
} from '@/components-new-version/models/helius.models'
import { TokenInfo } from '@/components-new-version/models/token.models'
import { useGetProfiles } from '@/components-new-version/tapestry/hooks/use-get-profiles'
import { useTokenInfo } from '@/components-new-version/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components-new-version/token/hooks/use-token-usdc-price'
import { SwapTransactionsViewDetails } from '@/components-new-version/transactions/swap-transactions/swap-transactions-view-details'
import { TransactionsHeader } from '@/components-new-version/transactions/transactions-header'
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
} from '@/components-new-version/ui'
import { SOL_MINT, USDC_MINT } from '@/components-new-version/utils/constants'
import { getSourceIcon } from '@/components-new-version/utils/transactions'
import { useEffect, useState } from 'react'

export type TokenDisplay = {
  mint: string
  amount: number
  tokenInfo?: TokenInfo
  loading?: boolean
  error?: string
}

interface Props {
  transaction: Transaction
  sourceWallet: string
  fromMint?: string
  toMint?: string
}

export function SwapTransactionsView({
  transaction,
  sourceWallet,
  fromMint,
  toMint,
}: Props) {
  const [fromToken, setFromToken] = useState<TokenDisplay | null>(null)
  const [toToken, setToToken] = useState<TokenDisplay | null>(null)

  const { profiles } = useGetProfiles({
    walletAddress: sourceWallet,
  })

  const { data: fromTokenInfo, loading: fromTokenLoading } = useTokenInfo(
    fromToken?.mint === SOL_MINT ? null : fromToken?.mint
  )
  const { data: toTokenInfo, loading: toTokenLoading } = useTokenInfo(
    toToken?.mint === SOL_MINT ? null : toToken?.mint
  )

  const shouldFetchFromPrice =
    fromToken?.mint &&
    (fromToken.mint === SOL_MINT || fromToken.mint === USDC_MINT)

  const shouldFetchToPrice =
    toToken?.mint && (toToken.mint === SOL_MINT || toToken.mint === USDC_MINT)

  // Always call hooks, but pass null when we don't want to fetch
  const { price: fromTokenPriceRaw, loading: fromPriceLoadingRaw } =
    useTokenUSDCPrice({
      tokenMint: shouldFetchFromPrice ? fromToken?.mint : null,
      decimals: shouldFetchFromPrice
        ? fromToken?.mint === SOL_MINT
          ? 9 // SOL has 9 decimals
          : fromToken?.tokenInfo?.result?.interface === 'FungibleToken' ||
            fromToken?.tokenInfo?.result?.interface === 'FungibleAsset'
          ? fromToken.tokenInfo.result.token_info?.decimals ?? 6
          : 6
        : 0,
    })

  const { price: toTokenPriceRaw, loading: toPriceLoadingRaw } =
    useTokenUSDCPrice({
      tokenMint: shouldFetchToPrice ? toToken?.mint : null,
      decimals: shouldFetchToPrice
        ? toToken?.mint === SOL_MINT
          ? 9 // SOL has 9 decimals
          : toToken?.tokenInfo?.result?.interface === 'FungibleToken' ||
            toToken?.tokenInfo?.result?.interface === 'FungibleAsset'
          ? toToken.tokenInfo.result.token_info?.decimals ?? 6
          : 6
        : 0,
    })

  const fromTokenPrice = shouldFetchFromPrice ? fromTokenPriceRaw : null
  const fromPriceLoading = shouldFetchFromPrice ? fromPriceLoadingRaw : false
  const toTokenPrice = shouldFetchToPrice ? toTokenPriceRaw : null
  const toPriceLoading = shouldFetchToPrice ? toPriceLoadingRaw : false

  useEffect(() => {
    async function loadTokenInfo() {
      if (!transaction.events) return
      // Handle swap event format
      const swapEvent = Array.isArray(transaction.events)
        ? transaction.events.find(
            (event): event is Extract<TransactionEvent, { type: 'SWAP' }> =>
              event.type === 'SWAP'
          )
        : undefined
      if (swapEvent) {
        // For token -> token swaps
        if (
          swapEvent.swap.tokenInputs?.[0] &&
          swapEvent.swap.tokenOutputs?.[0]
        ) {
          setFromToken({
            mint: swapEvent.swap.tokenInputs[0].mint,
            amount: swapEvent.swap.tokenInputs[0].tokenAmount,
          })

          setToToken({
            mint: swapEvent.swap.tokenOutputs[0].mint,
            amount: swapEvent.swap.tokenOutputs[0].tokenAmount,
          })
        }
        // For SOL -> token swaps
        else if (
          swapEvent.swap.nativeInput &&
          swapEvent.swap.tokenOutputs?.[0]
        ) {
          setFromToken({
            mint: SOL_MINT,
            amount: parseFloat(swapEvent.swap.nativeInput.amount),
          })

          setToToken({
            mint: swapEvent.swap.tokenOutputs[0].mint,
            amount: swapEvent.swap.tokenOutputs[0].tokenAmount,
          })
        }
        // For token -> SOL swaps
        else if (
          swapEvent.swap.tokenInputs?.[0] &&
          swapEvent.swap.nativeOutput
        ) {
          setFromToken({
            mint: swapEvent.swap.tokenInputs[0].mint,
            amount: swapEvent.swap.tokenInputs[0].tokenAmount,
          })

          setToToken({
            mint: SOL_MINT,
            amount: parseFloat(swapEvent.swap.nativeOutput.amount),
          })
        }
        return
      }

      // Fallback to description parsing for older format
      const descParts = transaction.description?.split(' ') || []
      const fromAmount = parseFloat(descParts[2] || '0')
      const toAmount = parseFloat(descParts[5] || '0')
      const fromTokenMint = fromMint || descParts[3] || ''
      const toTokenMint = toMint || descParts[6] || ''

      // Check if this is a SOL -> Token swap or Token -> SOL swap
      const isFromSol = fromTokenMint.toLowerCase() === 'sol'
      const isToSol = toTokenMint.toLowerCase() === 'sol'

      // Handle SOL -> Token swap
      if (isFromSol) {
        setFromToken({
          mint: SOL_MINT,
          amount: fromAmount,
        })

        if (toTokenMint) {
          setToToken({
            mint: toTokenMint,
            amount: toAmount,
          })
        }
      }
      // Handle Token -> SOL swap
      else if (isToSol) {
        setToToken({
          mint: SOL_MINT,
          amount: toAmount,
        })

        if (fromTokenMint) {
          setFromToken({
            mint: fromTokenMint,
            amount: fromAmount,
          })
        }
      }
      // Handle Token -> Token swap (including when mints are provided directly)
      else {
        if (fromTokenMint) {
          setFromToken({
            mint: fromTokenMint,
            amount: fromAmount,
          })
        }
        if (toTokenMint) {
          setToToken({
            mint: toTokenMint,
            amount: toAmount,
          })
        }
      }
    }

    loadTokenInfo()
  }, [transaction, sourceWallet, fromMint, toMint])

  useEffect(() => {
    if (fromToken && fromTokenInfo) {
      setFromToken((prev) =>
        prev ? { ...prev, tokenInfo: fromTokenInfo } : null
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTokenInfo])

  useEffect(() => {
    if (toToken && toTokenInfo) {
      setToToken((prev) => (prev ? { ...prev, tokenInfo: toTokenInfo } : null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toTokenInfo])

  if (!fromToken || !toToken) return null

  return (
    <Card>
      <CardHeader>
        <TransactionsHeader
          transaction={transaction}
          sourceWallet={sourceWallet}
          profiles={profiles}
          withCopyTradeButton
        >
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-md">
              Swap
            </Badge>
            {transaction.source && (
              <>
                <p>on</p>
                <Badge className="rounded-md" variant="outline">
                  {getSourceIcon(transaction.source)}
                  <span>{transaction.source}</span>
                </Badge>
              </>
            )}
          </div>
        </TransactionsHeader>
      </CardHeader>

      <CardContent className="space-y-4">
        <SwapTransactionsViewDetails
          token={fromToken}
          tokenLoading={fromTokenLoading}
          tokenPrice={fromTokenPrice}
          priceLoading={fromTokenLoading}
        />
        <SwapTransactionsViewDetails
          token={toToken}
          tokenLoading={toTokenLoading}
          tokenPrice={toTokenPrice}
          priceLoading={toTokenLoading}
          isReceived
        />
      </CardContent>
    </Card>
  )
}
