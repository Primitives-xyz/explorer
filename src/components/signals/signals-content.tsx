'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CreatorTable } from './creator-table'
import { ProfitorTable } from './profitor-table'
import { WalletDetailPanel } from './wallet-detail-panel'
import { LiveFeed } from './live-feed'
import { InfoTip } from './info-tip'
import { BondingFunnel } from './bonding-funnel'
import {
  TokenActivityView,
  type WalletTokenActivity,
} from './token-activity-view'
import type {
  CreatorProfile,
  IndividualTrade,
  ProfitorProfile,
  CreatorSelfSellAlert,
} from './signals-types'

function deduplicateTradesBySignature(trades: IndividualTrade[]): IndividualTrade[] {
  const seen = new Set<string>()
  return trades.filter((trade) => {
    if (seen.has(trade.signature)) return false
    seen.add(trade.signature)
    return true
  })
}

type Tab = 'creators' | 'profitors' | 'feed' | 'bonding'

type TokenViewState = {
  mint: string
  symbol: string
} | null

export function SignalsContent() {
  const [activeTab, setActiveTab] = useState<Tab>('creators')
  const [creatorMap, setCreatorMap] = useState<Record<string, CreatorProfile>>(
    {}
  )
  const [profitorList, setProfitorList] = useState<ProfitorProfile[]>([])
  const [alerts, setAlerts] = useState<CreatorSelfSellAlert[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [tokenView, setTokenView] = useState<TokenViewState>(null)
  const [connected, setConnected] = useState(false)
  // High-water mark: the maximum bonding progress each token has ever reached.
  // Tracked separately because sells can push the live value back down.
  const [maxBondingProgress, setMaxBondingProgress] = useState<Record<string, number>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const alertsRef = useRef(alerts)
  alertsRef.current = alerts

  /** Update maxBondingProgress from a list of token entries (never decreases). */
  const applyBondingHighWaterMark = useCallback(
    (tokens: CreatorProfile['tokensCreated']) => {
      setMaxBondingProgress((prev) => {
        let changed = false
        const next = { ...prev }
        for (const token of tokens) {
          const prog = token.fullyBonded ? 1 : token.bondingProgress
          if (prog > (next[token.mint] ?? 0)) {
            next[token.mint] = prog
            changed = true
          }
        }
        return changed ? next : prev
      })
    },
    []
  )

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data)

      switch (msg.type) {
        case 'CreatorMapSnapshot': {
          const snapshot = (msg.data || {}) as Record<string, CreatorProfile>
          setCreatorMap(snapshot)
          // Seed high-water marks from the snapshot
          for (const profile of Object.values(snapshot)) {
            applyBondingHighWaterMark(profile.tokensCreated)
          }
          break
        }

        case 'ProfitorLeaderboard':
          setProfitorList(msg.data || [])
          break

        case 'CreatorUpdate': {
          const profile = msg.data as CreatorProfile
          setCreatorMap((prev) => ({ ...prev, [profile.wallet]: profile }))
          applyBondingHighWaterMark(profile.tokensCreated)
          break
        }

        case 'CreatorSelfSell': {
          const alert = msg.data as CreatorSelfSellAlert
          setAlerts((prev) => [alert, ...prev].slice(0, 200))
          break
        }

        case 'ProfitorUpdate': {
          const profitor = msg.data as ProfitorProfile
          setProfitorList((prev) => {
            const idx = prev.findIndex((p) => p.wallet === profitor.wallet)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = profitor
              return next
            }
            return [...prev, profitor]
              .sort((a, b) => b.totalSellVolume - a.totalSellVolume)
              .slice(0, 100)
          })
          break
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_LASERSTREAM_WEBSOCKET || 'ws://localhost:3000'
    const protocol = wsUrl.startsWith('https') ? 'wss' : 'ws'
    const cleanUrl = wsUrl.replace(/^https?/, protocol)

    const ws = new WebSocket(cleanUrl)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)
    ws.onmessage = handleMessage

    return () => {
      ws.close()
    }
  }, [handleMessage])

  const creatorCount = Object.keys(creatorMap).length
  const selfSellerCount = Object.values(creatorMap).filter(
    (c) => c.soldOwnTokens
  ).length

  // Build wallet activities for the Token Activity View by scanning profitors
  const tokenViewData = useMemo(() => {
    if (!tokenView) return null

    const { mint } = tokenView

    // Find which wallet created this token
    let creatorWallet: string | null = null
    let creatorToken = null
    for (const profile of Object.values(creatorMap)) {
      const token = profile.tokensCreated.find((t) => t.mint === mint)
      if (token) {
        creatorWallet = profile.wallet
        creatorToken = token
        break
      }
    }

    // Gather all wallet activity for this mint from profitor data
    const activities: WalletTokenActivity[] = []
    for (const profitor of profitorList) {
      const tokenEntry = profitor.tokenActivity.find((t) => t.mint === mint)
      if (tokenEntry) {
        const trades = deduplicateTradesBySignature(tokenEntry.trades || [])
        activities.push({
          wallet: profitor.wallet,
          buyVolume: tokenEntry.buyVolume,
          sellVolume: tokenEntry.sellVolume,
          tradeCount: trades.length,
          trades,
          isCreator: profitor.wallet === creatorWallet,
        })
      }
    }

    // The creator wallet may not be in profitorList (which is capped at top 100
    // by sell volume). If we have creator-profile data for this token, synthesize
    // an entry from it so the creator always appears in the activity table.
    if (creatorWallet && !activities.find((a) => a.wallet === creatorWallet)) {
      const selfSell = creatorMap[creatorWallet]?.selfSellDetails.find(
        (s) => s.mint === mint
      )
      const buyVolume = creatorToken?.creatorInitialBuySol ?? 0
      const sellVolume = selfSell?.sellVolume ?? 0
      if (buyVolume > 0 || sellVolume > 0) {
        activities.push({
          wallet: creatorWallet,
          buyVolume,
          sellVolume,
          tradeCount: (buyVolume > 0 ? 1 : 0) + (selfSell?.sellCount ?? 0),
          trades: [],
          isCreator: true,
        })
      }
    }

    return { creatorWallet, creatorToken, activities }
  }, [tokenView, creatorMap, profitorList])

  const handleViewToken = useCallback((mint: string, symbol: string) => {
    setTokenView({ mint, symbol })
  }, [])

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'creators', label: 'Token Creators', count: creatorCount },
    { key: 'profitors', label: 'Top Profitors', count: profitorList.length },
    { key: 'feed', label: 'Live Feed', count: alerts.length },
    { key: 'bonding', label: 'Bonding Funnel' },
  ]

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Signals</h1>
            <InfoTip
              content={
                <>
                  <span className="font-semibold block mb-1">How this works</span>
                  Data is collected by subscribing to Pump.fun program transactions
                  via Helius Enhanced WebSockets. Every Create, Buy, and Sell
                  event is parsed and indexed by wallet address in real-time.
                  <span className="block mt-1.5 font-semibold">Key limitations:</span>
                  <ul className="list-disc pl-3.5 mt-0.5 space-y-0.5">
                    <li>Only Pump.fun bonding curve activity — no Raydium/DEX trades after graduation</li>
                    <li>Session-based data (restored from Redis on restart, but no full historical backfill)</li>
                    <li>PnL is estimated (sell - buy), ignoring unsold holdings, fees, and slippage</li>
                    <li>Self-sell detection is exact-wallet only — doesn&apos;t trace token transfers to alt wallets</li>
                    <li>Volume is raw lamports from TradeEvents, not market-adjusted</li>
                  </ul>
                </>
              }
            />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time wallet analytics from Pump.fun
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-xs text-muted-foreground font-mono">
            {connected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Creators Tracked"
          value={creatorCount}
          info="Wallets that have called the Pump.fun Create instruction since this session started. Only tracks creates seen by the live stream — not historical."
        />
        <StatCard
          label="Self-Sellers"
          value={selfSellerCount}
          variant="warning"
          info="Creators who sold tokens they themselves created on Pump.fun. A common pattern in rug-pulls, but not always malicious — some creators legitimately take profit."
        />
        <StatCard
          label="Profitors"
          value={profitorList.length}
          info="Wallets ranked by total sell volume on Pump.fun. Only includes trades seen since session start (or last Redis restore). Does not include DEX trades after graduation."
        />
        <StatCard
          label="Alerts"
          value={alerts.length}
          variant="info"
          info="Real-time events such as creator self-sells. These fire the moment a wallet that created a token is detected selling that same token."
        />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/80'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 text-xs font-mono text-muted-foreground">
                {tab.count}
              </span>
            )}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'creators' && (
        <CreatorTable
          creators={Object.values(creatorMap)}
          onSelectWallet={setSelectedWallet}
        />
      )}
      {activeTab === 'profitors' && (
        <ProfitorTable
          profitors={profitorList}
          onSelectWallet={setSelectedWallet}
        />
      )}
      {activeTab === 'feed' && (
        <LiveFeed alerts={alerts} onSelectWallet={setSelectedWallet} />
      )}
      {activeTab === 'bonding' && (
        <BondingFunnel
          maxProgress={maxBondingProgress}
          creatorMap={creatorMap}
          onSelectWallet={setSelectedWallet}
        />
      )}

      {/* Wallet detail panel */}
      {selectedWallet && (
        <WalletDetailPanel
          wallet={selectedWallet}
          creator={creatorMap[selectedWallet] || null}
          profitor={
            profitorList.find((p) => p.wallet === selectedWallet) || null
          }
          onClose={() => setSelectedWallet(null)}
          onViewToken={handleViewToken}
        />
      )}

      {/* Token Activity View */}
      {tokenView && tokenViewData && (
        <TokenActivityView
          mint={tokenView.mint}
          symbol={tokenView.symbol}
          creatorWallet={tokenViewData.creatorWallet}
          creatorToken={tokenViewData.creatorToken}
          walletActivities={tokenViewData.activities}
          onSelectWallet={(wallet) => {
            setTokenView(null)
            setSelectedWallet(wallet)
          }}
          onClose={() => setTokenView(null)}
        />
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  variant = 'default',
  info,
}: {
  label: string
  value: number
  variant?: 'default' | 'warning' | 'info'
  info?: string
}) {
  const colorClass =
    variant === 'warning'
      ? 'text-amber-400'
      : variant === 'info'
        ? 'text-blue-400'
        : 'text-foreground'

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
        {label}
        {info && <InfoTip content={info} />}
      </div>
      <div className={`text-xl font-bold font-mono ${colorClass}`}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}
