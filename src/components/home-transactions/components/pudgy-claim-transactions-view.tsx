'use client'

import { EPudgyTheme } from '@/components/pudgy/pudgy.models'
import { Avatar } from '@/components/ui/avatar/avatar'
import { route } from '@/utils/route'
import { cn } from '@/utils/utils'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle, ExternalLink, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { IHomeTransaction } from '../home-transactions.models'

interface Props {
  transaction: IHomeTransaction & {
    content?: {
      type?: string
      burnAmount?: string
      tokenSymbol?: string
      burnAmountUsd?: string
      username?: string
      pudgyTheme?: string
      pudgyFrame?: string
      walletAddress?: string
      walletUsername?: string
      walletImage?: string
      timestamp?: string
      txSignature?: string
    }
  }
  sourceWallet: string
}

export function PudgyClaimTransactionsView({ transaction }: Props) {
  const content = transaction.content
  if (!content) return null

  const timestamp = content.timestamp
    ? new Date(Number(content.timestamp))
    : new Date(transaction.timestamp)

  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })

  // Map theme to colors
  const themeColors = {
    BLUE: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    PINK: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
    GREEN: 'from-green-500/20 to-green-600/20 border-green-500/30',
    DEFAULT: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  }

  const selectedThemeColors =
    themeColors[content.pudgyTheme as keyof typeof themeColors] ||
    themeColors.DEFAULT

  return (
    <div className="relative">
      {/* Main Card */}
      <div
        className={cn(
          'relative rounded-xl border-2 bg-gradient-to-br overflow-hidden',
          selectedThemeColors
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/pudgy/mountains-banner.webp"
            alt="Pudgy Mountains"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  username={
                    content.walletUsername || content.walletAddress || 'User'
                  }
                  imageUrl={content.walletImage}
                  size={48}
                  className="h-12 w-12 border-2 border-white/20"
                />
                {/* Pudgy Badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
              <div>
                <Link
                  href={route('entity', { id: content.username || '' })}
                  className="font-semibold hover:underline flex items-center gap-1"
                >
                  {content.username}
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </Link>
                <p className="text-sm text-muted-foreground">{timeAgo}</p>
              </div>
            </div>

            {/* Transaction Link */}
            <Link
              href={`https://solscan.io/tx/${content.txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Main Content */}
          <div className="space-y-3">
            {/* Title */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h3 className="font-pudgy-heading text-xl uppercase">
                Claimed Pudgy Profile!
              </h3>
            </div>

            {/* Burn Details */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Burned</span>
                <span className="font-semibold">
                  {content.burnAmount} {content.tokenSymbol}
                </span>
              </div>
              {content.burnAmountUsd && content.burnAmountUsd !== '0' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Value</span>
                  <span className="text-sm">${content.burnAmountUsd}</span>
                </div>
              )}
            </div>

            {/* Profile Preview */}
            <div className="flex items-center justify-center py-4">
              <div className="relative">
                {/* Avatar with Frame */}
                <div className="relative w-24 h-24">
                  <Avatar
                    username={content.username || 'User'}
                    imageUrl={content.walletImage}
                    size={96}
                    className="w-full h-full"
                    pudgyTheme={content.pudgyTheme as EPudgyTheme}
                    displayPudgyFrame={content.pudgyFrame === 'true'}
                  />
                </div>
                {/* Theme Badge */}
                <div
                  className={cn(
                    'absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold',
                    'bg-white/90 backdrop-blur-sm border'
                  )}
                >
                  {content.pudgyTheme} Theme
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={route('entity', { id: content.username || '' })}
              className="block"
            >
              <div className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg p-3 text-center font-medium">
                View Pudgy Profile →
              </div>
            </Link>
          </div>
        </div>

        {/* Pudgy Character */}
        <div className="absolute bottom-0 right-0 w-20 h-24">
          <Image
            src="/images/pudgy/pudgy-banner.webp"
            alt="Pudgy"
            fill
            className="object-contain object-bottom"
          />
        </div>
      </div>
    </div>
  )
}
