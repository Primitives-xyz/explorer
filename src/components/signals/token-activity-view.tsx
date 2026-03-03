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
import { InfoTip, HeaderWithInfo } from './info-tip'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { SOL_MINT } from '@/utils/constants'
import type {
  IndividualTrade,
  CreatedTokenEntry,
} from './signals-types'

interface Props {
  mint: string
  symbol: string
  creatorWallet: string | null
  creatorToken: CreatedTokenEntry | null
  walletActivities: WalletTokenActivity[]
  onSelectWallet: (wallet: string) => void
  onClose: () => void
}

export type WalletTokenActivity = {
  wallet: string
  buyVolume: number
  sellVolume: number
  tradeCount: number
  trades: IndividualTrade[]
  isCreator: boolean
}

type SortKey = 'totalVolume' | 'buyVolume' | 'sellVolume' | 'pnl' | 'tradeCount'
type SortDir = 'asc' | 'desc'

export function TokenActivityView({
  mint,
  symbol,
  creatorWallet,
  creatorToken,
  walletActivities,
  onSelectWallet,
  onClose,
}: Props) {
  const { setOpen, setInputs } = useSwapStore()
  const [sortKey, setSortKey] = useState<SortKey>('totalVolume')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedTradeWallet, setSelectedTradeWallet] = useState<string | null>(
    null
  )

  const handleBuy = (amount: number) => {
    setInputs({
      inputMint: SOL_MINT,
      outputMint: mint,
      inputAmount: amount,
      platform: 'signals',
    })
    setOpen(true)
  }

  const sorted = useMemo(() => {
    const list = [...walletActivities]
    list.sort((a, b) => {
      let aVal: number
      let bVal: number
      switch (sortKey) {
        case 'totalVolume':
          aVal = a.buyVolume + a.sellVolume
          bVal = b.buyVolume + b.sellVolume
          break
        case 'buyVolume':
          aVal = a.buyVolume
          bVal = b.buyVolume
          break
        case 'sellVolume':
          aVal = a.sellVolume
          bVal = b.sellVolume
          break
        case 'pnl':
          aVal = a.sellVolume - a.buyVolume
          bVal = b.sellVolume - b.buyVolume
          break
        case 'tradeCount':
          aVal = a.tradeCount
          bVal = b.tradeCount
          break
        default:
          return 0
      }
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })
    return list
  }, [walletActivities, sortKey, sortDir])

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

  const totalBuyVol = walletActivities.reduce((s, w) => s + w.buyVolume, 0)
  const totalSellVol = walletActivities.reduce((s, w) => s + w.sellVolume, 0)
  const totalVol = totalBuyVol + totalSellVol
  const buyPercent = totalVol > 0 ? (totalBuyVol / totalVol) * 100 : 50

  const selectedWalletTrades = selectedTradeWallet
    ? walletActivities.find((w) => w.wallet === selectedTradeWallet)
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Token Activity
              <InfoTip content="All wallet activity for this token seen during the current session. Shows every wallet that has traded this token on Pump.fun, with buy/sell breakdowns and individual trade history." />
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-medium text-foreground">
                {symbol || 'Unknown'}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {mint.slice(0, 8)}...{mint.slice(-6)}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(mint)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[0.1, 0.5, 1].map((amount) => (
              <button
                key={amount}
                onClick={() => handleBuy(amount)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors"
              >
                Buy {amount} SOL
              </button>
            ))}
            <a
              href={`https://pump.fun/${mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-colors"
            >
              Pump.fun
            </a>
            <a
              href={`https://solscan.io/token/${mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Solscan
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-5">
          {/* Token summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MiniStat
              label="Total Volume"
              value={formatSol(totalVol)}
              info="Combined buy + sell volume for this token across all wallets on Pump.fun."
            />
            <MiniStat
              label="Buy Volume"
              value={formatSol(totalBuyVol)}
              color="text-green-400"
              info="Total SOL spent buying this token on the bonding curve."
            />
            <MiniStat
              label="Sell Volume"
              value={formatSol(totalSellVol)}
              color="text-red-400"
              info="Total SOL received from selling this token on the bonding curve."
            />
            <MiniStat
              label="Traders"
              value={String(walletActivities.length)}
              info="Number of distinct wallets that have traded this token."
            />
            {creatorToken && (
              <MiniStat
                label="Creator Buy-in"
                value={
                  creatorToken.creatorInitialBuySol > 0
                    ? formatSol(creatorToken.creatorInitialBuySol)
                    : 'None'
                }
                color="text-purple-400"
                info="SOL the creator spent buying their own token in the same transaction as the create. This is the creator's initial investment into the bonding curve."
              />
            )}
          </div>

          {/* Buy/Sell ratio bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Buy/Sell Ratio</span>
              <span className="font-mono">
                {buyPercent.toFixed(1)}% buy / {(100 - buyPercent).toFixed(1)}%
                sell
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-muted">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${buyPercent}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${100 - buyPercent}%` }}
              />
            </div>
          </div>

          {/* Bonding progress */}
          {creatorToken && (
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1.5">
                  Bonding Progress
                  <InfoTip content="Progress toward Pump.fun graduation (~74 SOL in real reserves). At 100% the token migrates to Raydium." />
                </span>
                <span className="font-mono">
                  {(creatorToken.bondingProgress * 100).toFixed(1)}%
                  {creatorToken.fullyBonded && (
                    <Badge className="ml-2 bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">
                      GRADUATED
                    </Badge>
                  )}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden bg-muted relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    creatorToken.fullyBonded
                      ? 'bg-green-400'
                      : creatorToken.bondingProgress > 0.7
                        ? 'bg-amber-400'
                        : 'bg-primary'
                  }`}
                  style={{
                    width: `${Math.min(creatorToken.bondingProgress * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Creator info */}
          {creatorWallet && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
              <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30">
                Creator
              </Badge>
              <button
                onClick={() => onSelectWallet(creatorWallet)}
                className="font-mono text-xs text-primary hover:underline"
              >
                {creatorWallet.slice(0, 6)}...{creatorWallet.slice(-6)}
              </button>
              {creatorToken && creatorToken.creatorInitialBuySol > 0 && (
                <span className="text-xs text-muted-foreground">
                  Initial buy:{' '}
                  <span className="text-purple-400 font-mono">
                    {formatSol(creatorToken.creatorInitialBuySol)}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Wallet activity table */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              Wallet Activity
              <InfoTip content="Every wallet that traded this token, sorted by volume. Click a row to see that wallet's individual trades for this token." />
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Wallet</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('buyVolume')}
                  >
                    <HeaderWithInfo
                      label="Buy Vol"
                      info="SOL spent buying this token on the Pump.fun bonding curve."
                    />
                    <SortIndicator column="buyVolume" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('sellVolume')}
                  >
                    <HeaderWithInfo
                      label="Sell Vol"
                      info="SOL received selling this token on the Pump.fun bonding curve."
                    />
                    <SortIndicator column="sellVolume" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('pnl')}
                  >
                    <HeaderWithInfo
                      label="PnL"
                      info="Sell volume minus buy volume for this specific token. Does not include unsold holdings."
                    />
                    <SortIndicator column="pnl" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('tradeCount')}
                  >
                    Trades
                    <SortIndicator column="tradeCount" />
                  </TableHead>
                  <TableHead className="w-[60px]">% Vol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No wallet activity recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((wa) => {
                    const pnl = wa.sellVolume - wa.buyVolume
                    const walletVol = wa.buyVolume + wa.sellVolume
                    const volPercent =
                      totalVol > 0 ? (walletVol / totalVol) * 100 : 0
                    const isSelected = selectedTradeWallet === wa.wallet

                    return (
                      <TableRow
                        key={wa.wallet}
                        className={`cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
                        onClick={() =>
                          setSelectedTradeWallet(
                            isSelected ? null : wa.wallet
                          )
                        }
                      >
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onSelectWallet(wa.wallet)
                              }}
                              className="text-primary hover:underline"
                            >
                              {wa.wallet.slice(0, 4)}...{wa.wallet.slice(-4)}
                            </button>
                            {wa.isCreator && (
                              <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-[10px] px-1 py-0">
                                C
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-green-400/80">
                          {formatSol(wa.buyVolume)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-red-400/80">
                          {formatSol(wa.sellVolume)}
                        </TableCell>
                        <TableCell
                          className={`font-mono text-sm font-bold ${
                            pnl > 0
                              ? 'text-green-400'
                              : pnl < 0
                                ? 'text-red-400'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {pnl >= 0 ? '+' : ''}
                          {formatSol(pnl)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {wa.tradeCount}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {volPercent.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Individual trade history for selected wallet */}
          {selectedWalletTrades && (
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    Trade History:{' '}
                    <span className="font-mono text-primary">
                      {selectedTradeWallet?.slice(0, 4)}...
                      {selectedTradeWallet?.slice(-4)}
                    </span>
                    <InfoTip content="Individual trades for this wallet on this token. Shows up to the last 100 trades, ordered newest first." />
                  </h3>
                  <button
                    onClick={() => setSelectedTradeWallet(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </div>
                {selectedWalletTrades.trades.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 font-mono py-2">
                    Individual trade history is only available for wallets tracked
                    in the profitor leaderboard. This wallet&apos;s volume is recorded
                    from creator-profile data only (aggregates, no per-trade signatures).
                  </p>
                ) : (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {[...selectedWalletTrades.trades]
                    .reverse()
                    .map((trade) => (
                      <div
                        key={trade.signature}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs ${
                          trade.isBuy
                            ? 'bg-green-500/5 border border-green-500/10'
                            : 'bg-red-500/5 border border-red-500/10'
                        }`}
                      >
                        <span
                          className={`font-semibold uppercase w-10 ${
                            trade.isBuy ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {trade.isBuy ? 'BUY' : 'SELL'}
                        </span>
                        <span className="font-mono text-foreground">
                          {formatSol(trade.solAmount)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatAge(trade.timestamp)}
                        </span>
                        <a
                          href={`https://solscan.io/tx/${trade.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto font-mono text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {trade.signature.slice(0, 8)}...
                        </a>
                      </div>
                    ))}
                </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  color,
  info,
}: {
  label: string
  value: string
  color?: string
  info?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-2.5">
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
        {label}
        {info && <InfoTip content={info} />}
      </div>
      <div
        className={`text-sm font-bold font-mono ${color || 'text-foreground'}`}
      >
        {value}
      </div>
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
