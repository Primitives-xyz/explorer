'use client'

import { TokenDisplay } from '@/components/transactions/swap-transactions/swap-transactions-view'
import { SOL_MINT } from '@/components/utils/constants'
import { abbreviateWalletAddress, formatNumber } from '@/components/utils/utils'
import { route } from '@/utils/routes'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  token: TokenDisplay
  tokenLoading: boolean
  tokenPrice: number | null
  priceLoading: boolean
  isReceived?: boolean
}

export function SwapTransactionsViewDetails({
  token,
  tokenLoading,
  tokenPrice,
  priceLoading,
  isReceived,
}: Props) {
  return (
    <div className="flex bg-card-accent rounded-lg px-4 gap-4 items-center justify-between h-12 ml-12">
      <div className="flex items-center gap-2">
        <div className="bg-card rounded-full w-9 h-9 flex items-center justify-center">
          {token.mint === SOL_MINT ? (
            <Image
              src="/images/solana-icon.svg"
              alt="solana icon"
              width={36}
              height={36}
              className="rounded-full aspect-square"
            />
          ) : tokenLoading ? (
            <div className="animate-pulse w-8 h-8 rounded-lg" />
          ) : token.tokenInfo?.result?.content?.links?.image ? (
            <Image
              width={36}
              height={36}
              src={token.tokenInfo.result.content.links.image}
              alt={token.tokenInfo.result?.content?.metadata?.symbol || 'Token'}
              className="rounded-full aspect-square"
            />
          ) : (
            <span className="font-mono text-xs">{token.mint.slice(0, 2)}</span>
          )}
        </div>
        <Link href={route('address', { id: token.mint })}>
          <p className="hover:opacity-80">
            {token.mint === SOL_MINT
              ? 'SOL'
              : token.tokenInfo?.result?.content?.metadata?.symbol ||
                `${abbreviateWalletAddress({ address: token.mint })}`}
          </p>
        </Link>
      </div>

      <div className="flex flex-col items-end justify-center">
        <div className="flex items-baseline gap-1">
          <span className={isReceived ? 'text-primary' : 'text-destructive'}>
            {isReceived ? '+' : '-'}
          </span>
          <span className="text-md">{formatNumber(token.amount)}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {tokenPrice !== null && !priceLoading
            ? `$${formatNumber(token.amount * tokenPrice)}`
            : priceLoading
            ? 'Loading...'
            : ''}
        </span>
      </div>
    </div>
  )
}
