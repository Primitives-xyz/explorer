'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { InfoTip, HeaderWithInfo } from './info-tip'
import type { CreatorProfile } from './signals-types'

interface Props {
  /** mint -> max bonding progress ever seen (0–1, 1 = graduated) */
  maxProgress: Record<string, number>
  creatorMap: Record<string, CreatorProfile>
  onSelectWallet?: (wallet: string) => void
}

type TokenRow = {
  mint: string
  symbol: string
  maxProgress: number
  creatorWallet: string
}

const DEFAULT_THRESHOLDS = [10, 25, 50, 75, 100]

export function BondingFunnel({ maxProgress, creatorMap, onSelectWallet }: Props) {
  const [thresholds, setThresholds] = useState<number[]>(DEFAULT_THRESHOLDS)
  const [thresholdInput, setThresholdInput] = useState('')
  const [selectedThreshold, setSelectedThreshold] = useState<number | null>(null)
  const [hideGraduated, setHideGraduated] = useState(false)

  // Flat index of every tracked token mint -> metadata
  const tokenIndex = useMemo<TokenRow[]>(() => {
    const rows: TokenRow[] = []
    for (const [wallet, creator] of Object.entries(creatorMap)) {
      for (const token of creator.tokensCreated) {
        rows.push({
          mint: token.mint,
          symbol: token.symbol || token.name || 'Unknown',
          // prefer high-water mark; fall back to current value from stream
          maxProgress: maxProgress[token.mint] ?? (token.fullyBonded ? 1 : token.bondingProgress),
          creatorWallet: wallet,
        })
      }
    }
    return rows
  }, [creatorMap, maxProgress])

  // When hiding graduated, exclude tokens that have hit 100%
  const visibleTokens = useMemo(
    () => (hideGraduated ? tokenIndex.filter((t) => t.maxProgress < 1) : tokenIndex),
    [tokenIndex, hideGraduated]
  )

  const totalTokens = visibleTokens.length

  const sortedThresholds = useMemo(
    () => [...thresholds].sort((a, b) => a - b),
    [thresholds]
  )

  // For each threshold compute funnel stats
  const funnelRows = useMemo(() => {
    return sortedThresholds.map((threshold, i) => {
      const decimal = threshold / 100
      const reachedCount = visibleTokens.filter((t) => t.maxProgress >= decimal).length

      const prevThreshold = i > 0 ? sortedThresholds[i - 1] : null
      const prevDecimal = prevThreshold !== null ? prevThreshold / 100 : null
      const prevCount =
        prevDecimal !== null
          ? visibleTokens.filter((t) => t.maxProgress >= prevDecimal).length
          : totalTokens

      const conversionRate = prevCount > 0 ? (reachedCount / prevCount) * 100 : 0

      return {
        threshold,
        reachedCount,
        percentOfAll: totalTokens > 0 ? (reachedCount / totalTokens) * 100 : 0,
        conversionRate,
        prevThreshold,
      }
    })
  }, [sortedThresholds, visibleTokens, totalTokens])

  // Tokens for the selected milestone, sorted by max progress desc
  const selectedTokens = useMemo<TokenRow[]>(() => {
    if (selectedThreshold === null) return []
    const decimal = selectedThreshold / 100
    return visibleTokens
      .filter((t) => t.maxProgress >= decimal)
      .sort((a, b) => b.maxProgress - a.maxProgress)
  }, [selectedThreshold, visibleTokens])

  const addThreshold = () => {
    const val = parseInt(thresholdInput, 10)
    if (!isNaN(val) && val > 0 && val <= 100 && !thresholds.includes(val)) {
      setThresholds((prev) => [...prev, val].sort((a, b) => a - b))
    }
    setThresholdInput('')
  }

  const removeThreshold = (t: number) => {
    setThresholds((prev) => prev.filter((v) => v !== t))
    if (selectedThreshold === t) setSelectedThreshold(null)
  }

  const conversionColor = (rate: number) => {
    if (rate >= 50) return 'text-green-400'
    if (rate >= 25) return 'text-amber-400'
    return 'text-red-400'
  }

  const progressColor = (p: number) => {
    if (p >= 1) return 'bg-green-400'
    if (p >= 0.7) return 'bg-amber-400'
    return 'bg-primary'
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-1.5">
            Bonding Curve Funnel
            <InfoTip
              content={
                <>
                  Tracks the <strong>peak</strong> bonding progress each token has ever
                  reached this session — even if sells pushed it back down afterwards.
                  <br />
                  <br />
                  Conversion rate shows what fraction of tokens that hit the previous
                  milestone also hit this one. Click a row to see which tokens are at
                  that milestone.
                </>
              }
            />
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalTokens} tokens tracked · click a row to inspect tokens at that milestone
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setHideGraduated((v) => !v)}
            className={`h-8 px-3 text-xs font-medium border rounded-md transition-colors ${
              hideGraduated
                ? 'bg-green-500/15 border-green-500/30 text-green-400'
                : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Hide graduated
          </button>
          <input
            type="number"
            min="1"
            max="100"
            value={thresholdInput}
            onChange={(e) => setThresholdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addThreshold()}
            placeholder="Add %"
            className="w-20 h-8 px-2 text-xs font-mono bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={addThreshold}
            className="h-8 px-3 text-xs font-medium bg-primary/15 text-primary border border-primary/30 rounded-md hover:bg-primary/25 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Funnel table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card/50">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                Milestone
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                Tokens Reached
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                % of All
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <HeaderWithInfo
                  label="Conv. Rate"
                  info="Of tokens that reached the previous milestone, what % also reached this one."
                />
              </th>
              <th className="px-3 py-2.5 w-8" />
            </tr>
          </thead>
          <tbody>
            {funnelRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-muted-foreground py-10 text-xs"
                >
                  No thresholds configured
                </td>
              </tr>
            ) : (
              funnelRows.map((row) => (
                <tr
                  key={row.threshold}
                  onClick={() =>
                    setSelectedThreshold(
                      selectedThreshold === row.threshold ? null : row.threshold
                    )
                  }
                  className={`cursor-pointer border-b border-border/40 transition-colors ${
                    selectedThreshold === row.threshold
                      ? 'bg-primary/10'
                      : 'hover:bg-accent/40'
                  }`}
                >
                  {/* Milestone bar + label */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progressColor(row.threshold / 100)}`}
                          style={{ width: `${row.threshold}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        {row.threshold}%
                      </span>
                      {row.threshold === 100 && (
                        <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0">
                          GRAD
                        </Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {row.reachedCount}
                  </td>

                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    {row.percentOfAll.toFixed(1)}%
                  </td>

                  <td className="px-4 py-3 text-right">
                    {row.prevThreshold !== null ? (
                      <span
                        className={`font-mono font-semibold ${conversionColor(row.conversionRate)}`}
                      >
                        {row.conversionRate.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">baseline</span>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeThreshold(row.threshold)
                      }}
                      className="text-muted-foreground hover:text-red-400 transition-colors text-xs leading-none"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Per-milestone token list */}
      {selectedThreshold !== null && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-card/50 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              Tokens that reached{' '}
              <span className="text-primary font-mono">{selectedThreshold}%</span>
              <span className="ml-2 text-muted-foreground">
                ({selectedTokens.length})
              </span>
            </span>
            <button
              onClick={() => setSelectedThreshold(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                    Token
                  </th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                    Peak Progress
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                    Creator
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedTokens.map((token) => (
                  <tr
                    key={token.mint}
                    className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">
                          {token.symbol}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {token.mint.slice(0, 6)}...{token.mint.slice(-4)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progressColor(token.maxProgress)}`}
                            style={{
                              width: `${Math.min(token.maxProgress * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-mono text-xs ${
                              token.maxProgress >= 1
                                ? 'text-green-400'
                                : token.maxProgress >= 0.7
                                  ? 'text-amber-400'
                                  : 'text-foreground'
                            }`}
                          >
                            {(token.maxProgress * 100).toFixed(1)}%
                          </span>
                          {token.maxProgress >= 1 && (
                            <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px] px-1 py-0">
                              GRAD
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      {onSelectWallet ? (
                        <button
                          onClick={() => onSelectWallet(token.creatorWallet)}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {token.creatorWallet.slice(0, 6)}...
                          {token.creatorWallet.slice(-4)}
                        </button>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">
                          {token.creatorWallet.slice(0, 6)}...
                          {token.creatorWallet.slice(-4)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
