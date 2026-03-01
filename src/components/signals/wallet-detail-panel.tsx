'use client'

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
import type { CreatorProfile, ProfitorProfile } from './signals-types'
import Link from 'next/link'

interface Props {
  wallet: string
  creator: CreatorProfile | null
  profitor: ProfitorProfile | null
  onClose: () => void
  onViewToken?: (mint: string, symbol: string) => void
}

export function WalletDetailPanel({
  wallet,
  creator,
  profitor,
  onClose,
  onViewToken,
}: Props) {
  const { setOpen, setInputs } = useSwapStore()

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Wallet Details
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-primary">
                {wallet.slice(0, 8)}...{wallet.slice(-8)}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(wallet)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/investigate/${wallet}`}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors"
            >
              Investigate
            </Link>
            <a
              href={`https://solscan.io/account/${wallet}`}
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

        <div className="p-4 flex flex-col gap-6">
          {/* Role badges */}
          <div className="flex flex-wrap gap-2">
            {creator && (
              <InfoTip content="This wallet has called the Pump.fun Create instruction to launch new tokens.">
                <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 cursor-help">
                  Token Creator ({creator.totalTokensCreated})
                </Badge>
              </InfoTip>
            )}
            {creator?.soldOwnTokens && (
              <InfoTip content="This creator sold tokens from at least one of their own mints. Does not detect sells from transferred wallets.">
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 cursor-help">
                  Self-Seller
                </Badge>
              </InfoTip>
            )}
            {profitor && profitor.estimatedPnL > 0 && (
              <InfoTip content="Estimated PnL is positive (sells > buys). Only covers Pump.fun trades — does not include DEX activity, unsold tokens, or fees.">
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 cursor-help">
                  Profitable (+{formatSol(profitor.estimatedPnL)})
                </Badge>
              </InfoTip>
            )}
          </div>

          {/* Summary stats */}
          {profitor && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniStat
                label="Total Buy"
                value={formatSol(profitor.totalBuyVolume)}
                info="Sum of SOL spent across all Pump.fun buy trades."
              />
              <MiniStat
                label="Total Sell"
                value={formatSol(profitor.totalSellVolume)}
                info="Sum of SOL received across all Pump.fun sell trades."
              />
              <MiniStat
                label="Est. PnL"
                value={`${profitor.estimatedPnL >= 0 ? '+' : ''}${formatSol(profitor.estimatedPnL)}`}
                color={profitor.estimatedPnL >= 0 ? 'text-green-400' : 'text-red-400'}
                info="Sell volume minus buy volume. Does not include unsold tokens, fees, or post-graduation DEX trades."
              />
              <MiniStat
                label="Tokens Traded"
                value={String(profitor.tokensTraded)}
                info="Distinct Pump.fun token mints this wallet has interacted with."
              />
            </div>
          )}

          {/* Created tokens */}
          {creator && creator.tokensCreated.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                Tokens Created
                {onViewToken && (
                  <span className="text-xs font-normal text-muted-foreground">
                    — click a row to view token activity
                  </span>
                )}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>
                      <HeaderWithInfo
                        label="Initial Buy"
                        info="SOL the creator spent buying their own token in the same transaction as the create. This is the creator's initial investment into the bonding curve."
                      />
                    </TableHead>
                    <TableHead>
                      <HeaderWithInfo
                        label="Bonding"
                        info="Progress toward the Pump.fun bonding curve graduation threshold (~74 SOL in real reserves). At 100% the token graduates to Raydium."
                      />
                    </TableHead>
                    <TableHead>
                      <HeaderWithInfo
                        label="Volume"
                        info="Total buy + sell volume for this token on the Pump.fun bonding curve (not post-graduation DEX volume)."
                      />
                    </TableHead>
                    <TableHead>
                      <HeaderWithInfo
                        label="Self-Sold?"
                        info="Whether the creator wallet sold this specific token, and how much. Only detects direct sells — not sells via transferred wallets."
                      />
                    </TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creator.tokensCreated
                    .slice()
                    .reverse()
                    .map((token) => {
                      const selfSell = creator.selfSellDetails.find(
                        (s) => s.mint === token.mint
                      )
                      return (
                        <TableRow
                          key={token.mint}
                          className={onViewToken ? 'cursor-pointer hover:bg-accent/50' : ''}
                          onClick={() =>
                            onViewToken?.(
                              token.mint,
                              token.symbol || token.name || 'Unknown'
                            )
                          }
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className={`font-medium text-sm ${onViewToken ? 'text-primary' : ''}`}>
                                {token.symbol || token.name || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {token.mint.slice(0, 6)}...{token.mint.slice(-4)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatAge(token.createdAt)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {token.creatorInitialBuySol > 0 ? (
                              <span className="text-purple-400">
                                {formatSol(token.creatorInitialBuySol)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    token.fullyBonded
                                      ? 'bg-green-400'
                                      : token.bondingProgress > 0.7
                                        ? 'bg-amber-400'
                                        : 'bg-primary'
                                  }`}
                                  style={{
                                    width: `${Math.min(token.bondingProgress * 100, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-mono text-muted-foreground">
                                {(token.bondingProgress * 100).toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatSol(token.totalVolume)}
                          </TableCell>
                          <TableCell>
                            {selfSell ? (
                              <span className="text-amber-400 text-xs font-mono">
                                {formatSol(selfSell.sellVolume)} ({selfSell.sellCount}x)
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                No
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={(e) => handleBuy(token.mint, e)}
                              className="px-2 py-1 rounded-md text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors"
                            >
                              Buy
                            </button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Trading activity */}
          {profitor && profitor.tokenActivity.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                Trading Activity (Top Tokens)
                {onViewToken && (
                  <span className="text-xs font-normal text-muted-foreground">
                    — click a row to view token activity
                  </span>
                )}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>
                      <HeaderWithInfo
                        label="Buy Vol"
                        info="SOL spent buying this token on Pump.fun bonding curves."
                      />
                    </TableHead>
                    <TableHead>
                      <HeaderWithInfo
                        label="Sell Vol"
                        info="SOL received selling this token on Pump.fun bonding curves."
                      />
                    </TableHead>
                    <TableHead>
                      <HeaderWithInfo
                        label="PnL"
                        info="Sell volume minus buy volume for this token. Does not include unrealized value of tokens still held."
                      />
                    </TableHead>
                    <TableHead>Trades</TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitor.tokenActivity
                    .slice()
                    .sort((a, b) => (b.sellVolume - b.buyVolume) - (a.sellVolume - a.buyVolume))
                    .slice(0, 15)
                    .map((entry) => {
                      const pnl = entry.sellVolume - entry.buyVolume
                      return (
                        <TableRow
                          key={entry.mint}
                          className={onViewToken ? 'cursor-pointer hover:bg-accent/50' : ''}
                          onClick={() =>
                            onViewToken?.(
                              entry.mint,
                              entry.symbol || entry.mint.slice(0, 8)
                            )
                          }
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className={`font-medium text-sm ${onViewToken ? 'text-primary' : ''}`}>
                                {entry.symbol || entry.mint.slice(0, 8)}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {entry.mint.slice(0, 6)}...{entry.mint.slice(-4)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {formatSol(entry.buyVolume)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatSol(entry.sellVolume)}
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
                            {entry.tradeCount}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={(e) => handleBuy(entry.mint, e)}
                              className="px-2 py-1 rounded-md text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors"
                            >
                              Buy
                            </button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Empty state */}
          {!creator && !profitor && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No analytics data available for this wallet yet.
              <br />
              <Link
                href={`/investigate/${wallet}`}
                className="text-primary hover:underline mt-2 inline-block"
              >
                View full transaction history
              </Link>
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
      <div className={`text-sm font-bold font-mono ${color || 'text-foreground'}`}>
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
