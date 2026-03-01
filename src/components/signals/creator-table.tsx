'use client'

import { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { HeaderWithInfo } from './info-tip'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { SOL_MINT } from '@/utils/constants'
import type { CreatorProfile } from './signals-types'

type SortKey =
  | 'totalTokensCreated'
  | 'totalSellVolumeOwn'
  | 'lastSeen'
  | 'soldOwnTokens'
type SortDir = 'asc' | 'desc'

interface Props {
  creators: CreatorProfile[]
  onSelectWallet: (wallet: string) => void
}

export function CreatorTable({ creators, onSelectWallet }: Props) {
  const { setOpen, setInputs } = useSwapStore()
  const [sortKey, setSortKey] = useState<SortKey>('totalTokensCreated')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterSelfSellers, setFilterSelfSellers] = useState(false)

  const handleBuy = (mint: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setInputs({
      inputMint: SOL_MINT,
      outputMint: mint,
      inputAmount: 0.1,
      platform: 'signals',
    })
    setOpen(true)
  }

  const sorted = useMemo(() => {
    let list = [...creators]
    if (filterSelfSellers) {
      list = list.filter((c) => c.soldOwnTokens)
    }
    list.sort((a, b) => {
      let aVal: number
      let bVal: number
      switch (sortKey) {
        case 'totalTokensCreated':
          aVal = a.totalTokensCreated
          bVal = b.totalTokensCreated
          break
        case 'totalSellVolumeOwn':
          aVal = a.totalSellVolumeOwn
          bVal = b.totalSellVolumeOwn
          break
        case 'lastSeen':
          aVal = a.lastSeen
          bVal = b.lastSeen
          break
        case 'soldOwnTokens':
          aVal = a.soldOwnTokens ? 1 : 0
          bVal = b.soldOwnTokens ? 1 : 0
          break
        default:
          return 0
      }
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })
    return list
  }, [creators, sortKey, sortDir, filterSelfSellers])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null
    return (
      <span className="ml-1 text-primary">
        {sortDir === 'desc' ? '\u2193' : '\u2191'}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filter controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilterSelfSellers(!filterSelfSellers)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            filterSelfSellers
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          Self-sellers only
        </button>
        <span className="text-xs text-muted-foreground font-mono">
          {sorted.length} creator{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Wallet</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => toggleSort('totalTokensCreated')}
            >
              <HeaderWithInfo
                label="Tokens Created"
                info="Number of Pump.fun tokens this wallet has created via the Create instruction. Only counts creates seen during this session."
              />
              <SortIndicator column="totalTokensCreated" />
            </TableHead>
            <TableHead>Latest Token</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => toggleSort('soldOwnTokens')}
            >
              <HeaderWithInfo
                label="Sold Own?"
                info={
                  <>
                    Whether this creator has sold any token they created. Detected
                    when the same wallet address appears in both a CreateEvent and
                    a subsequent sell TradeEvent for the same mint.
                    <span className="block mt-1.5 text-amber-400/80">
                      Limitation: Only detects sells from the exact creator
                      wallet. If they transfer tokens to another wallet first,
                      then sell from there, this won&apos;t flag it.
                    </span>
                  </>
                }
              />
              <SortIndicator column="soldOwnTokens" />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => toggleSort('totalSellVolumeOwn')}
            >
              <HeaderWithInfo
                label="Self-Sell Vol"
                info={
                  <>
                    Total SOL volume from this creator selling their own tokens.
                    Calculated as sum of solAmount from all sell TradeEvents where
                    the trader wallet matches the creator wallet.
                    <span className="block mt-1.5 text-amber-400/80">
                      Limitation: Values are in lamports from the bonding curve,
                      not market price. Does not account for fees or slippage.
                    </span>
                  </>
                }
              />
              <SortIndicator column="totalSellVolumeOwn" />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => toggleSort('lastSeen')}
            >
              <HeaderWithInfo
                label="Last Active"
                info="Time since this wallet's most recent create or trade event was seen in the stream."
              />
              <SortIndicator column="lastSeen" />
            </TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-12"
              >
                {creators.length === 0
                  ? 'Waiting for creator data...'
                  : 'No creators match the current filter'}
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((creator) => {
              const latestToken =
                creator.tokensCreated[creator.tokensCreated.length - 1]
              return (
                <TableRow
                  key={creator.wallet}
                  className="cursor-pointer"
                  onClick={() => onSelectWallet(creator.wallet)}
                >
                  <TableCell className="font-mono text-xs">
                    <span className="text-primary hover:underline">
                      {creator.wallet.slice(0, 4)}...
                      {creator.wallet.slice(-4)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold">
                      {creator.totalTokensCreated}
                    </span>
                  </TableCell>
                  <TableCell>
                    {latestToken ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {latestToken.symbol || latestToken.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatAge(latestToken.createdAt)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {creator.soldOwnTokens ? (
                      <Badge
                        variant="destructive"
                        className="text-xs bg-amber-500/15 text-amber-400 border-amber-500/30"
                      >
                        YES ({creator.selfSellDetails.length})
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">No</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {creator.totalSellVolumeOwn > 0
                      ? formatSol(creator.totalSellVolumeOwn)
                      : '-'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatAge(creator.lastSeen)}
                  </TableCell>
                  <TableCell>
                    {latestToken && (
                      <button
                        onClick={(e) => handleBuy(latestToken.mint, e)}
                        className="px-2 py-1 rounded-md text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors"
                      >
                        Buy
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function formatSol(lamports: number): string {
  const sol = lamports / 1e9
  if (sol >= 1000) return `${(sol / 1000).toFixed(1)}K SOL`
  if (sol >= 1) return `${sol.toFixed(2)} SOL`
  return `${sol.toFixed(4)} SOL`
}

function formatAge(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
