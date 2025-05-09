'use client'

import { TokenRow } from '@/components/trenches/trenches-components'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { SOL_MINT } from '@/utils/constants'
import { useIsMobile } from '@/utils/use-is-mobile'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useRef, useState } from 'react'
import { MintAggregate } from './trenches-types'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { Switch } from '@/components/ui/switch/switch'
import { Skeleton } from '@/components/ui/skeleton'

export function TrenchesContent() {
  const { isMobile } = useIsMobile()
  const { setOpen, setInputs, open } = useSwapStore()
  const [mintMap, setMintMap] = useState<Record<string, MintAggregate>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const [currency, setCurrency] = useState<'SOL' | 'USD'>('USD')
  const [disableAnimations, setDisableAnimations] = useState(false)
  const { price: solPrice, loading: solPriceLoading } = useTokenUSDCPrice({ tokenMint: 'So11111111111111111111111111111111111111112', decimals: 9 })

  // Tweakable weights for Dev's Choice selection
  const ALPHA = 1; // weight for liquidity
  const BETA = 1;  // weight for transaction count

  useEffect(() => {
    const ws = new window.WebSocket(
      process.env.NEXT_PUBLIC_LASERSTREAM_WEBSOCKET ||
        'wss://laserstream.fly.dev'
    )
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'MintMapSnapshot') {
          setMintMap(msg.data)
        } else if (msg.type === 'MintAggregateUpdate') {
          setMintMap((prev) => ({
            ...prev,
            [msg.data.mint]: msg.data,
          }))
        }
        // (Handle other message types as needed)
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
  const now = Date.now() / 1000
  let tokens = Object.values(mintMap)
  // Sort by TPS descending for all views
  tokens = tokens.sort((a, b) => (b.tps || 0) - (a.tps || 0))

  // Dev's Choice selection logic
  const maxLiquidity = Math.max(...tokens.map(t => t.realLiquidity || 0), 1)
  const maxTx = Math.max(...tokens.map(t => (t.trades?.length || 0)), 1)
  const devsChoice = tokens
    .map(t => ({
      ...t,
      _score: ((t.realLiquidity || 0) / maxLiquidity) * ALPHA + ((t.trades?.length || 0) / maxTx) * BETA
    }))
    .sort((a, b) => b._score - a._score)[0]

  // Filter for each column, ensuring no overlap
  const graduatedMints = new Set(
    tokens.filter((agg) => agg.fullyBonded).map((agg) => agg.mint)
  )
  const aboutToGraduateMints = new Set(
    tokens
      .filter((agg) => !graduatedMints.has(agg.mint) && agg.aboutToGraduate)
      .map((agg) => agg.mint)
  )
  const newlyMinted = tokens
    .filter(
      (agg) =>
        !graduatedMints.has(agg.mint) &&
        !aboutToGraduateMints.has(agg.mint) &&
        (agg as any).tokenCreatedAt &&
        now - (agg as any).tokenCreatedAt < 3600
    )
    .slice(0, 50)
  const aboutToGraduate = tokens
    .filter((agg) => aboutToGraduateMints.has(agg.mint))
    .slice(0, 50)
  const recentlyGraduated = tokens
    .filter((agg) => graduatedMints.has(agg.mint))
    .slice(0, 50)

  // Helper for price display
  const solPriceDisplay = solPriceLoading ? '...' : solPrice ? `$${solPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '--'

  return (
    <div className={`flex flex-col w-full justify-center items-center py-6 gap-4${isMobile ? ' px-2' : ''}`}>
      {/* Dev's Choice Section */}
      {devsChoice && (
        <div className="w-full max-w-7xl mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-yellow-400">Dev's Choice</span>
            <span className="text-2xl">👑</span>
          </div>
          <TokenRow
            agg={devsChoice}
            onClick={(mint, buyAmount = 0.01) => {
              setOpen(true)
              setTimeout(() => {
                setInputs({ inputMint: SOL_MINT, outputMint: mint, inputAmount: buyAmount })
              }, 0)
            }}
            createdAt={devsChoice.tokenCreatedAt}
            volume={(devsChoice.volumePerToken || 0) / LAMPORTS_PER_SOL}
            currency={currency}
            solPrice={solPrice}
            disableFlash={disableAnimations}
            variant="accent"
            className="!text-xl border-2 border-yellow-400 shadow-lg bg-gradient-to-r from-yellow-900/40 to-yellow-700/10 p-4"
          />
        </div>
      )}
      <div className="flex flex-col items-center gap-2 mb-4 w-full max-w-7xl">
        {/* Controls: Price + Toggle + Disable Animations */}
        <div className={`w-full flex ${isMobile ? 'flex-col gap-2 items-center' : 'flex-row items-center justify-between'}`}>  
          {/* Price + Toggle Row */}
          <div className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2 text-xs text-gray-400`}>
            <span className={currency === 'SOL' ? 'font-bold text-white' : ''}>1 SOL</span>
            <Switch
              checked={currency === 'USD'}
              onCheckedChange={v => setCurrency(v ? 'USD' : 'SOL')}
              className="scale-90 mx-1"
              aria-label="Toggle SOL/USD"
            />
            <span className={currency === 'USD' ? 'font-bold text-white' : ''}>
              {solPriceDisplay} USD
            </span>
          </div>
          {/* Disable Animations Checkbox */}
          <label className={`flex items-center gap-1 text-xs cursor-pointer select-none ${isMobile ? '' : 'ml-4'}`} style={isMobile ? { marginTop: 4 } : {}}>
            <input
              type="checkbox"
              checked={disableAnimations}
              onChange={e => setDisableAnimations(e.target.checked)}
              className="accent-primary w-3 h-3"
            />
            Disable Animations
          </label>
        </div>
      </div>
      <div className={`w-full max-w-7xl grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        {/* Newly Minted */}
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold mb-2 text-white/80 text-center">Newly Minted</div>
          {newlyMinted.length === 0 && aboutToGraduate.length === 0 && recentlyGraduated.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="w-full h-[120px] rounded-lg bg-neutral-800" />
              </div>
            ))
          ) : (
            newlyMinted.map((agg) => (
              <TokenRow
                key={agg.mint}
                agg={agg}
                onClick={(mint, buyAmount = 0.01) => {
                  setOpen(true)
                  setTimeout(() => {
                    setInputs({ inputMint: SOL_MINT, outputMint: mint, inputAmount: buyAmount })
                  }, 0)
                }}
                createdAt={(agg as any).tokenCreatedAt}
                volume={((agg as any).volumePerToken || 0) / LAMPORTS_PER_SOL}
                currency={currency}
                solPrice={solPrice}
                disableFlash={disableAnimations}
              />
            ))
          )}
        </div>
        {/* About to Graduate */}
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold mb-2 text-white/80 text-center">About to Graduate</div>
          {newlyMinted.length === 0 && aboutToGraduate.length === 0 && recentlyGraduated.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="w-full h-[120px] rounded-lg bg-neutral-800" />
              </div>
            ))
          ) : (
            aboutToGraduate.map((agg) => (
              <TokenRow
                key={agg.mint}
                agg={agg}
                onClick={(mint, buyAmount = 0.01) => {
                  setOpen(true)
                  setTimeout(() => {
                    setInputs({ inputMint: SOL_MINT, outputMint: mint, inputAmount: buyAmount })
                  }, 0)
                }}
                createdAt={(agg as any).tokenCreatedAt}
                volume={((agg as any).volumePerToken || 0) / LAMPORTS_PER_SOL}
                currency={currency}
                solPrice={solPrice}
                disableFlash={disableAnimations}
              />
            ))
          )}
        </div>
        {/* Recently Graduated */}
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold mb-2 text-white/80 text-center">Recently Graduated</div>
          {newlyMinted.length === 0 && aboutToGraduate.length === 0 && recentlyGraduated.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-full">
                <Skeleton className="w-full h-[120px] rounded-lg bg-neutral-800" />
              </div>
            ))
          ) : (
            recentlyGraduated.map((agg) => (
              <TokenRow
                key={agg.mint}
                agg={agg}
                onClick={(mint, buyAmount = 0.01) => {
                  setOpen(true)
                  setTimeout(() => {
                    setInputs({ inputMint: SOL_MINT, outputMint: mint, inputAmount: buyAmount })
                  }, 0)
                }}
                createdAt={(agg as any).tokenCreatedAt}
                volume={((agg as any).volumePerToken || 0) / LAMPORTS_PER_SOL}
                currency={currency}
                solPrice={solPrice}
                disableFlash={disableAnimations}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
