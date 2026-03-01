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
import type { ProfitorProfile } from './signals-types'

type SortKey =
  | 'totalSellVolume'
  | 'estimatedPnL'
  | 'tokensTraded'
  | 'lastSeen'
type SortDir = 'asc' | 'desc'

interface Props {
  profitors: ProfitorProfile[]
  onSelectWallet: (wallet: string) => void
}

export function ProfitorTable({ profitors, onSelectWallet }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('totalSellVolume')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [minSellSol, setMinSellSol] = useState(0)

  const sorted = useMemo(() => {
    const threshold = minSellSol * 1e9
    let list = profitors.filter((p) => p.totalSellVolume >= threshold)

    list.sort((a, b) => {
      const aVal = a[sortKey] as number
      const bVal = b[sortKey] as number
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })
    return list
  }, [profitors, sortKey, sortDir, minSellSol])

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

  const thresholds = [0, 1, 5, 10, 50]

  return (
    <div className="flex flex-col gap-3">
      {/* Filter controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Min sell:</span>
        {thresholds.map((t) => (
          <button
            key={t}
            onClick={() => setMinSellSol(t)}
            className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
              minSellSol === t
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 0 ? 'All' : `${t}+ SOL`}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {sorted.length} wallet{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead className="w-[200px]">Wallet</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => toggleSort('totalSellVolume')}
            >
              <HeaderWithInfo
                label="Total Sell"
                info={
                  <>
                    Total SOL received from all sell trades on Pump.fun bonding
                    curves. Sum of solAmount from every sell TradeEvent.
                    <span className="block mt-1.5 text-amber-400/80">
                      Limitation: Only tracks Pump.fun sells, not post-graduation
                      DEX trades (Raydium, etc). Does not reflect actual SOL
                      received after fees.
                    </span>
                  </>
                }
              />
              <SortIndicator column="totalSellVolume" />
            </TableHead>
            <TableHead>
              <HeaderWithInfo
                label="Total Buy"
                info="Total SOL spent on buy trades via Pump.fun bonding curves. Same limitations as Total Sell."
              />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => toggleSort('estimatedPnL')}
            >
              <HeaderWithInfo
                label="Est. PnL"
                info={
                  <>
                    Estimated profit/loss: Total Sell minus Total Buy. A rough
                    approximation only.
                    <span className="block mt-1.5 text-amber-400/80">
                      Limitations: (1) Only covers Pump.fun trades, not Raydium
                      or other DEXs after graduation. (2) Doesn&apos;t account for
                      tokens still held (unrealized PnL). (3) Ignores transaction
                      fees. (4) If a wallet buys on Pump and sells on Raydium,
                      it&apos;ll show as a loss here.
                    </span>
                  </>
                }
              />
              <SortIndicator column="estimatedPnL" />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => toggleSort('tokensTraded')}
            >
              <HeaderWithInfo
                label="Tokens"
                info="Number of distinct Pump.fun tokens this wallet has traded (bought or sold)."
              />
              <SortIndicator column="tokensTraded" />
            </TableHead>
            <TableHead>
              <HeaderWithInfo
                label="Biggest Win"
                info={
                  <>
                    The token where this wallet had the highest estimated PnL
                    (sell volume minus buy volume for that specific token).
                    <span className="block mt-1.5 text-amber-400/80">
                      Same PnL limitations apply — only Pump.fun trades, no
                      unrealized gains, no fees.
                    </span>
                  </>
                }
              />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => toggleSort('lastSeen')}
            >
              <HeaderWithInfo
                label="Last Active"
                info="Time since this wallet's most recent trade was seen in the Pump.fun stream."
              />
              <SortIndicator column="lastSeen" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground py-12"
              >
                {profitors.length === 0
                  ? 'Waiting for trade data...'
                  : 'No profitors match the current filter'}
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((profitor, idx) => {
              const pnl = profitor.estimatedPnL
              const pnlColor =
                pnl > 0
                  ? 'text-green-400'
                  : pnl < 0
                    ? 'text-red-400'
                    : 'text-muted-foreground'

              return (
                <TableRow
                  key={profitor.wallet}
                  className="cursor-pointer"
                  onClick={() => onSelectWallet(profitor.wallet)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <span className="text-primary hover:underline">
                      {profitor.wallet.slice(0, 4)}...
                      {profitor.wallet.slice(-4)}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm font-bold">
                    {formatSol(profitor.totalSellVolume)}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {formatSol(profitor.totalBuyVolume)}
                  </TableCell>
                  <TableCell className={`font-mono text-sm font-bold ${pnlColor}`}>
                    {pnl >= 0 ? '+' : ''}
                    {formatSol(pnl)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {profitor.tokensTraded}
                  </TableCell>
                  <TableCell>
                    {profitor.biggestWin && profitor.biggestWin.pnl > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {profitor.biggestWin.symbol ||
                            profitor.biggestWin.mint.slice(0, 6)}
                        </span>
                        <span className="text-xs text-green-400 font-mono">
                          +{formatSol(profitor.biggestWin.pnl)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatAge(profitor.lastSeen)}
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
  if (Math.abs(sol) >= 1000) return `${(sol / 1000).toFixed(1)}K SOL`
  if (Math.abs(sol) >= 1) return `${sol.toFixed(2)} SOL`
  return `${sol.toFixed(4)} SOL`
}

function formatAge(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
