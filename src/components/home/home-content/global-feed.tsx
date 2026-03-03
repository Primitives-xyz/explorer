'use client'

import { Avatar } from '@/components/ui/avatar/avatar'
import { Skeleton } from '@/components/ui'
import { route } from '@/utils/route'
import { ArrowRight, ExternalLink, Heart, MessageCircle, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

// Shape returned by /api/contents (Tapestry flattens properties into `content`)
type FeedContent = {
  id: string
  type?: string
  inputMint?: string
  outputMint?: string
  inputAmount?: string
  expectedOutput?: string
  inputTokenSymbol?: string
  outputTokenSymbol?: string
  inputTokenName?: string
  outputTokenName?: string
  inputTokenImage?: string
  outputTokenImage?: string
  inputTokenDecimals?: string
  outputTokenDecimals?: string
  txSignature?: string
  timestamp?: string
  inputAmountUsd?: string
  outputAmountUsd?: string
  transactionType?: string
  namespace?: string
  created_at?: number
}

type FeedEntry = {
  content: FeedContent
  authorProfile: {
    id: string
    username: string
    image?: string | null
    namespace: string
  }
  socialCounts: {
    likeCount: number
    commentCount: number
  }
}

type FeedResponse = {
  contents: FeedEntry[]
  page: number
  pageSize: number
}

const PAGE_SIZE = 20

function formatAge(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000)
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

function formatAmount(raw: string | undefined, decimals: string | undefined): string {
  if (!raw || !decimals) return ''
  const num = parseFloat(raw) / Math.pow(10, parseInt(decimals, 10))
  if (isNaN(num)) return ''
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`
  if (num >= 1) return num.toFixed(4)
  return num.toFixed(6)
}

function TokenLogo({ src, symbol }: { src?: string; symbol?: string }) {
  const [err, setErr] = useState(false)
  if (src && !err) {
    return (
      <div className="w-5 h-5 rounded-full bg-muted overflow-hidden shrink-0">
        <Image
          src={src}
          alt={symbol || ''}
          width={20}
          height={20}
          className="w-full h-full object-cover"
          onError={() => setErr(true)}
          unoptimized
        />
      </div>
    )
  }
  return (
    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
      <span className="font-mono text-[8px] text-muted-foreground">
        {(symbol || '?').slice(0, 2)}
      </span>
    </div>
  )
}

function TradeCard({ entry }: { entry: FeedEntry }) {
  const { content, authorProfile, socialCounts } = entry

  const inputSymbol = content.inputTokenSymbol || content.inputMint?.slice(0, 6) || '?'
  const outputSymbol = content.outputTokenSymbol || content.outputMint?.slice(0, 6) || '?'

  const inputReadable = formatAmount(content.inputAmount, content.inputTokenDecimals)
  const outputReadable = formatAmount(content.expectedOutput, content.outputTokenDecimals)

  const usdValue = content.inputAmountUsd ? parseFloat(content.inputAmountUsd) : 0
  const timestamp = content.timestamp ? parseInt(content.timestamp, 10) : (content.created_at || 0)

  return (
    <div className="px-4 py-3 border-b border-border/30 hover:bg-primary/[0.02] transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link href={route('entity', { id: authorProfile.username })} className="shrink-0 mt-0.5">
          <Avatar
            username={authorProfile.username}
            imageUrl={authorProfile.image}
            size={32}
            className="w-8 h-8"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={route('entity', { id: authorProfile.username })}
              className="font-mono text-xs font-semibold text-primary hover:underline truncate"
            >
              {authorProfile.username}
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              {timestamp > 0 && (
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  {formatAge(timestamp)}
                </span>
              )}
              {content.txSignature && (
                <a
                  href={`https://solscan.io/tx/${content.txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground/40 hover:text-primary transition-colors"
                >
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>

          {/* Trade row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <TokenLogo src={content.inputTokenImage} symbol={inputSymbol} />
              <span className="font-mono text-xs text-foreground font-medium">
                {inputSymbol}
              </span>
            </div>

            <ArrowRight size={12} className="text-muted-foreground/50 shrink-0" />

            <div className="flex items-center gap-1">
              <TokenLogo src={content.outputTokenImage} symbol={outputSymbol} />
              <span className="font-mono text-xs text-primary font-medium">
                {outputSymbol}
              </span>
            </div>

            {/* Amounts */}
            <span className="text-muted-foreground/40 text-[10px] mx-0.5">·</span>
            {usdValue > 0 ? (
              <span className="font-mono text-[11px] text-muted-foreground">
                ${usdValue.toFixed(2)}
              </span>
            ) : inputReadable ? (
              <span className="font-mono text-[11px] text-muted-foreground">
                {inputReadable} {inputSymbol}
              </span>
            ) : null}

            {outputReadable && (
              <>
                <span className="text-muted-foreground/40 text-[10px]">→</span>
                <span className="font-mono text-[11px] text-green-400/80">
                  {outputReadable} {outputSymbol}
                </span>
              </>
            )}
          </div>

          {/* Social row */}
          {(socialCounts.likeCount > 0 || socialCounts.commentCount > 0) && (
            <div className="flex items-center gap-3 mt-1.5">
              {socialCounts.likeCount > 0 && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/50">
                  <Heart size={10} />
                  {socialCounts.likeCount}
                </span>
              )}
              {socialCounts.commentCount > 0 && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/50">
                  <MessageCircle size={10} />
                  {socialCounts.commentCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TradeCardSkeleton() {
  return (
    <div className="px-4 py-3 border-b border-border/30">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-3 w-10 rounded" />
          </div>
          <Skeleton className="h-4 w-48 rounded" />
        </div>
      </div>
    </div>
  )
}

export function GlobalFeed() {
  const [entries, setEntries] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPage = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const params = new URLSearchParams({
        orderByField: 'created_at',
        orderByDirection: 'DESC',
        pageSize: String(PAGE_SIZE),
        page: String(pageNum),
      })
      const res = await fetch(`/api/contents?${params}`)
      if (!res.ok) return

      const data: FeedResponse = await res.json()
      const items = (data.contents || []).filter(
        (e) => e.content?.outputTokenSymbol || e.content?.outputMint
      )

      setEntries((prev) => (replace ? items : [...prev, ...items]))
      setHasMore(items.length >= PAGE_SIZE)
    } catch (e) {
      console.error('Failed to fetch feed:', e)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchPage(1, true).finally(() => setLoading(false))
  }, [fetchPage])

  const loadMore = async () => {
    const next = page + 1
    setPage(next)
    setLoadingMore(true)
    await fetchPage(next, false)
    setLoadingMore(false)
  }

  const refresh = () => {
    setPage(1)
    setLoading(true)
    fetchPage(1, true).finally(() => setLoading(false))
  }

  return (
    <div className="space-y-0">
      {/* Section header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          Recent Trades
        </span>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-muted-foreground/40 hover:text-primary transition-colors disabled:opacity-40"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Feed */}
      <div className="rounded-md border border-border/20 overflow-hidden bg-card/30">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <TradeCardSkeleton key={i} />)
        ) : entries.length === 0 ? (
          <div className="py-10 text-center font-mono text-xs text-muted-foreground/50">
            No trades yet
          </div>
        ) : (
          <>
            {entries.map((entry) => (
              <TradeCard key={entry.content.id || entry.content.txSignature} entry={entry} />
            ))}

            {hasMore && (
              <div className="px-4 py-3 border-t border-border/20 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  {loadingMore ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : null}
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
