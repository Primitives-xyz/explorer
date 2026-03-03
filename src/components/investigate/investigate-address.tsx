'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { Button, ButtonVariant } from '@/components/ui/button'
import { Skeleton } from '@/components/ui'
import { route } from '@/utils/route'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Filter,
  Terminal,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { WalletSummary } from './wallet-summary'
import { TransactionRow } from './transaction-row'
import { TransactionFilters, type FilterState } from './transaction-filters'

interface TransactionData {
  data: any[]
  paginationToken: string | null
}

const DEFAULT_FILTERS: FilterState = {
  status: 'any',
  tokenAccounts: 'balanceChanged',
  sortOrder: 'desc',
  blockTimeGte: '',
  blockTimeLte: '',
}

export function InvestigateAddress({ address }: { address: string }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [paginationToken, setPaginationToken] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [expandedTx, setExpandedTx] = useState<string | null>(null)

  const fetchTransactions = useCallback(
    async (pageToken?: string) => {
      const params = new URLSearchParams({
        address,
        sortOrder: filters.sortOrder,
        tokenAccounts: filters.tokenAccounts,
        limit: '50',
      })

      if (filters.status !== 'any') {
        params.set('status', filters.status)
      }
      if (filters.blockTimeGte) {
        params.set(
          'blockTimeGte',
          String(
            Math.floor(new Date(filters.blockTimeGte).getTime() / 1000)
          )
        )
      }
      if (filters.blockTimeLte) {
        params.set(
          'blockTimeLte',
          String(
            Math.floor(new Date(filters.blockTimeLte).getTime() / 1000)
          )
        )
      }
      if (pageToken) {
        params.set('paginationToken', pageToken)
      }

      const response = await fetch(
        `/api/investigate/transactions?${params.toString()}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      return (await response.json()) as TransactionData
    },
    [address, filters]
  )

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchTransactions()
      setTransactions(result.data || [])
      setPaginationToken(result.paginationToken)
    } catch (e) {
      setError('Failed to load transactions. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [fetchTransactions])

  const loadMore = async () => {
    if (!paginationToken || loadingMore) return
    setLoadingMore(true)
    try {
      const result = await fetchTransactions(paginationToken)
      setTransactions((prev) => [...prev, ...(result.data || [])])
      setPaginationToken(result.paginationToken)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
  }

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <MainContentWrapper className="pb-20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <Link href={route('investigate')}>
            <Button
              variant={ButtonVariant.GHOST}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-primary" />
            <h1 className="font-mono text-sm font-bold tracking-wider text-primary uppercase">
              Investigate
            </h1>
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex items-center justify-between bg-card border border-border/40 rounded-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-sm text-foreground hidden sm:block">
              {address}
            </span>
            <span className="font-mono text-sm text-foreground sm:hidden">
              {truncatedAddress}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyAddress}
              className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              title="Copy address"
            >
              <Copy size={14} />
            </button>
            <a
              href={`https://solscan.io/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              title="View on Solscan"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Wallet Summary */}
        <WalletSummary address={address} />

        {/* Transaction Section */}
        <div className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Transaction History
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <Filter size={12} />
              Filters
              <ChevronDown
                size={12}
                className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <TransactionFilters
              filters={filters}
              onChange={(newFilters) => {
                setFilters(newFilters)
              }}
            />
          )}

          {/* Error */}
          {error && (
            <div className="border border-destructive/30 rounded-md px-4 py-3 bg-destructive/5">
              <p className="font-mono text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Table Header */}
          <div className="grid grid-cols-[2rem_1fr_6rem_5rem_1fr] gap-2 px-3 py-2 border-b border-border/30 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
            <span />
            <span>Signature</span>
            <span>Time</span>
            <span>Status</span>
            <span className="text-right">Details</span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-10 rounded-md" />
              ))}
            </div>
          )}

          {/* Transactions */}
          {!loading && transactions.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="font-mono text-sm text-muted-foreground">
                No transactions found
              </p>
            </div>
          )}

          {!loading && (
            <div className="space-y-0.5">
              {transactions.map((tx, index) => (
                <TransactionRow
                  key={tx.transaction?.signatures?.[0] || `tx-${index}`}
                  transaction={tx}
                  isExpanded={
                    expandedTx === tx.transaction?.signatures?.[0]
                  }
                  onToggle={() => {
                    const sig = tx.transaction?.signatures?.[0]
                    setExpandedTx(expandedTx === sig ? null : sig)
                  }}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {paginationToken && !loading && (
            <div className="flex justify-center pt-4">
              <Button
                variant={ButtonVariant.GHOST}
                onClick={loadMore}
                disabled={loadingMore}
                className="font-mono text-xs tracking-wider text-muted-foreground hover:text-primary"
              >
                {loadingMore ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <>
                    Load More
                    <ChevronRight size={14} />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainContentWrapper>
  )
}
