'use client'

import { TokenDisplay } from '@/components-new-version/home/home-content/following-transactions/swap-transactions/swap-transactions-view'
import { SOL_MINT } from '@/components-new-version/utils/constants'
import { formatNumber } from '@/components-new-version/utils/utils'
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
    <div className="flex bg-card-accent rounded-lg px-4 py-2 gap-4 items-center justify-between">
      <div className="bg-card rounded-full w-9 h-9 flex items-center justify-center">
        {token.mint === SOL_MINT ? (
          <Image
            src="/images/solana-icon.svg"
            alt="solana icon"
            width={24}
            height={24}
            className="group-hover:scale-110 transition-transform"
          />
        ) : tokenLoading ? (
          <div className="animate-pulse w-8 h-8 rounded-lg" />
        ) : token.tokenInfo?.result?.content?.links?.image ? (
          <Image
            width={24}
            height={24}
            src={token.tokenInfo.result.content.links.image}
            alt={token.tokenInfo.result?.content?.metadata?.symbol || 'Token'}
            className="rounded-lg object-contain"
          />
        ) : (
          <span className="font-mono text-xs">{token.mint.slice(0, 2)}</span>
        )}
      </div>

      <div className="flex flex-col items-end justify-center">
        <div className="flex items-baseline gap-1">
          <span className={isReceived ? 'text-primary' : 'text-destructive'}>
            {isReceived ? '+' : '-'}
          </span>
          <span className="font-mono text-lg">
            {formatNumber(token.amount)}
          </span>
          <Link
            href={route('address', { id: token.mint })}
            className="font-mono text-base text-muted-foreground hover:text-muted-foreground/80 transition-colors"
          >
            {token.mint === SOL_MINT
              ? 'SOL'
              : token.tokenInfo?.result?.content?.metadata?.symbol ||
                `${token.mint.slice(0, 4)}...${token.mint.slice(-4)}`}
          </Link>
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
