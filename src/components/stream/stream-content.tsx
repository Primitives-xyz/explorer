'use client'

import { MintAggregate, StreamMessage, TokenModalState } from './stream-types'
import { TokenRow } from '@/components/stream/stream-components'
import { FilterTabs } from '@/components/ui/tabs/filter-tabs'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/popover/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox/checkbox'
import { Button } from '@/components/ui/button/button'
import { useEffect, useRef, useState } from 'react'

export function StreamContent() {
  const [mintMap, setMintMap] = useState<Record<string, MintAggregate>>({})
  const [modal, setModal] = useState<{ open: boolean; mint: string | null; tokenInfo: any }>({ open: false, mint: null, tokenInfo: null })
  const [view, setView] = useState<'all' | 'new' | 'about' | 'graduated'>('all')
  const [sort, setSort] = useState<'recent' | 'volume' | 'price'>('recent')
  const [onlyWithPrice, setOnlyWithPrice] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const TPS_WINDOW = 60 // seconds

  useEffect(() => {
    const ws = new window.WebSocket(process.env.LASERSTREAM_WEBSOCKET || 'ws://localhost:3000')
    wsRef.current = ws

    ws.onopen = () => {}
    ws.onmessage = (event) => {
      try {
        const parsed: StreamMessage = JSON.parse(event.data)
        const trade = parsed.eventData?.tradeEvents?.[0]
        if (!trade || !trade.mint) return
        // Only process pump and tap coins
        const mint = trade.mint
        const isPump = mint.endsWith('pump')
        const isTap = /tap$/i.test(mint)
        if (!isPump && !isTap) return
        setMintMap(prev => {
          const prevAgg = prev[trade.mint]
          const isBuy = trade.isBuy
          const solAmount = Number(trade.solAmount)
          let totalBuy = prevAgg?.totalBuy || 0
          let totalSell = prevAgg?.totalSell || 0
          if (isBuy) totalBuy += solAmount
          else totalSell += solAmount
          const trades = prevAgg ? [...prevAgg.trades, parsed] : [parsed]
          // TPS logic
          const now = Date.now() / 1000
          let tpsTimestamps = prevAgg?.tpsTimestamps ? [...prevAgg.tpsTimestamps] : []
          tpsTimestamps.push(now)
          tpsTimestamps = tpsTimestamps.filter(ts => now - ts <= TPS_WINDOW)
          const tps = tpsTimestamps.length / TPS_WINDOW
          return {
            ...prev,
            [trade.mint]: {
              mint: trade.mint,
              trades: trades.slice(-10),
              totalBuy,
              totalSell,
              lastTrade: parsed,
              tpsTimestamps,
              tps,
              lastUpdate: Date.now(),
            },
          }
        })
      } catch (e) {
        // ignore parse errors
      }
    }
    ws.onerror = () => {}
    ws.onclose = () => {}

    return () => {
      ws.close()
    }
  }, [])

  // Filtering and sorting logic
  let tokens = Object.values(mintMap).map(agg => {
    // Tag about-to-graduate if bonding progress > 80%
    const lastTrade = agg.lastTrade?.eventData?.tradeEvents?.[0]
    let aboutToGraduate = false
    if (lastTrade && lastTrade.realSolReserves && lastTrade.virtualSolReserves) {
      const real = Number(lastTrade.realSolReserves)
      const virt = Number(lastTrade.virtualSolReserves)
      const progress = virt > 0 ? real / virt : 0
      if (progress >= 0.8) aboutToGraduate = true
    }
    return { ...agg, aboutToGraduate }
  })
  // Filter by view
  if (view === 'about') {
    tokens = tokens.filter(agg => agg.aboutToGraduate)
  } else {
    tokens = tokens.sort((a, b) => (b.tps || 0) - (a.tps || 0)).slice(0, 10)
  }
  // Filter by price
  if (onlyWithPrice) {
    tokens = tokens.filter((agg) => {
      // Use a dummy TokenCard to get price, but for now just check if any trade has price info
      // This is a hack, ideally we would cache token info in parent
      // For now, allow all
      return true
    })
  }

  // Modal content
  const modalMint = modal.mint
  const modalAgg = modalMint ? mintMap[modalMint] : null
  const modalTokenInfo = modal.tokenInfo

  return (
    <div className="flex flex-col w-full justify-center items-center py-10 gap-6">
      {/* Global style for flash-shake animation */}
      <style>{`
        .flash-shake {
          animation: flash-shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes flash-shake {
          0% { background: #fff700; transform: translateX(0); }
          10% { background: #fff700; transform: translateX(-6px); }
          20% { background: #fff700; transform: translateX(6px); }
          30% { background: #fff700; transform: translateX(-6px); }
          40% { background: #fff700; transform: translateX(6px); }
          50% { background: #fff700; transform: translateX(-4px); }
          60% { background: #fff700; transform: translateX(4px); }
          70% { background: #fff700; transform: translateX(-2px); }
          80% { background: #fff700; transform: translateX(2px); }
          90% { background: #fff700; transform: translateX(0); }
          100% { background: inherit; transform: none; }
        }
      `}</style>
      <div className="w-full max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-row items-center gap-4">
          <FilterTabs
            options={[
              { label: 'All', value: 'all' },
              { label: 'Newly Minted', value: 'new' },
              { label: 'About to Graduate', value: 'about' },
              { label: 'Recently Graduated', value: 'graduated' },
            ]}
            selected={view}
            onSelect={(v) => setView(v as any)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Sort</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSort('recent')}>Most Recent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('volume')}>Most Volume</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('price')}>Highest Price</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <Checkbox checked={onlyWithPrice} onCheckedChange={() => setOnlyWithPrice((v) => !v)} />
            Only tokens with price
          </label>
        </div>
      </div>
      <div className="w-full max-w-4xl flex flex-col gap-2">
        {tokens.map((agg) => (
          <TokenRow
            key={agg.mint}
            agg={agg}
            onClick={(mint, tokenInfo) => setModal({ open: true, mint, tokenInfo })}
          />
        ))}
      </div>
      {/* Modal for expanded token view */}
      {modal.open && modalAgg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setModal({ open: false, mint: null, tokenInfo: null })}
            >
              ×
            </button>
            <div className="flex flex-col items-center mb-4">
              {modalTokenInfo?.image ? (
                <img src={modalTokenInfo.image} alt={modalTokenInfo.symbol || modalAgg.mint} className="w-14 h-14 rounded-full mb-2" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mb-2 font-mono text-lg">{modalAgg.mint.slice(0, 2)}</div>
              )}
              <div className="font-bold text-lg">{modalTokenInfo?.name || 'Loading...'}</div>
              <div className="text-xs text-gray-500">{modalTokenInfo?.symbol || modalAgg.mint.slice(0, 4)}</div>
              <div className="text-xs text-gray-400 break-all">{modalAgg.mint}</div>
              {modalTokenInfo?.data?.result && 'token_info' in modalTokenInfo.data.result &&
                modalTokenInfo.data.result.token_info?.price_info?.price_per_token && (
                  <div className="text-xs text-blue-600 mt-1">Price: ${modalTokenInfo.data.result.token_info.price_info.price_per_token.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                )}
              <div className="flex flex-row gap-4 text-xs mt-2">
                <div>Trades: <span className="font-bold">{modalAgg.trades.length}</span></div>
                <div>Buy: <span className="font-bold text-green-600">{(modalAgg.totalBuy / 10 ** (modalTokenInfo?.decimals ?? 9)).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span></div>
                <div>Sell: <span className="font-bold text-red-600">{(modalAgg.totalSell / 10 ** (modalTokenInfo?.decimals ?? 9)).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span></div>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="font-semibold text-xs mb-1">Live Feed</div>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                {modalAgg.trades.slice().reverse().map((trade, i) => {
                  const t = trade.eventData.tradeEvents[0]
                  return (
                    <div key={i} className="flex flex-row justify-between text-xs">
                      <span className={t.isBuy ? 'text-green-600' : 'text-red-600'}>{t.isBuy ? 'Buy' : 'Sell'}</span>
                      <span>{(Number(t.solAmount) / 10 ** (modalTokenInfo?.decimals ?? 9)).toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL</span>
                      <span className="text-gray-400">{t.user.slice(0, 4)}...{t.user.slice(-4)}</span>
                      <span className="text-gray-400">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Future: add chart, more stats, links, etc. */}
          </div>
        </div>
      )}
    </div>
  )
} 