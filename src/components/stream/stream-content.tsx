'use client'

import { TokenRow } from '@/components/stream/stream-components'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { SOL_MINT } from '@/utils/constants'
import { useIsMobile } from '@/utils/use-is-mobile'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useRef, useState } from 'react'
import { MintAggregate } from './stream-types'

export function StreamContent() {
  const { isMobile } = useIsMobile()
  const { setOpen, setInputs } = useSwapStore()
  const [mintMap, setMintMap] = useState<Record<string, MintAggregate>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const TPS_WINDOW = 60 // seconds

  useEffect(() => {
    const ws = new window.WebSocket(
      process.env.NEXT_PUBLIC_LASERSTREAM_WEBSOCKET ||
        'wss://laserstream.fly.dev'
    )
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        console.log({ msg })
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
  console.log({ mintMap })
  let tokens = Object.values(mintMap).map((agg) => {
    // Tag about-to-graduate if bonding progress > 70%
    const lastTrade = agg.lastTrade?.eventData?.tradeEvents?.[0]
    let aboutToGraduate = false
    let fullyBonded = false
    if (lastTrade && lastTrade.realSolReserves) {
      const real = Number(lastTrade.realSolReserves)
      const virt = 74 * LAMPORTS_PER_SOL
      const progress = virt > 0 ? real / virt : 0
      if (progress >= 0.7) aboutToGraduate = true
      if (progress >= 1.0) fullyBonded = true
    }
    return { ...agg, aboutToGraduate, fullyBonded }
  })
  // Sort by TPS descending for all views
  tokens = tokens.sort((a, b) => (b.tps || 0) - (a.tps || 0))

  // Filter for each column, ensuring no overlap
  const graduatedMints = new Set(
    tokens.filter((agg) => agg.fullyBonded).map((agg) => agg.mint)
  )
  const aboutToGraduateMints = new Set(
    tokens
      .filter((agg) => !graduatedMints.has(agg.mint) && agg.aboutToGraduate)
      .map((agg) => agg.mint)
  )
  console.log({ tokens })
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

  console.log(newlyMinted)

  return (
    <div
      className={`flex flex-col w-full justify-center items-center py-6 gap-4${
        isMobile ? ' px-2' : ''
      }`}
    >
      <div
        className={`w-full max-w-7xl grid ${
          isMobile ? 'grid-cols-1' : 'grid-cols-3'
        } gap-4`}
      >
        {/* Newly Minted */}
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold mb-2 text-white/80 text-center">
            Newly Minted
          </div>
          {newlyMinted.map((agg) => (
            <TokenRow
              key={agg.mint}
              agg={agg}
              onClick={(mint) => {
                setOpen(true)
                setInputs({
                  inputMint: SOL_MINT,
                  outputMint: mint,
                  inputAmount: 0,
                })
              }}
              createdAt={(agg as any).tokenCreatedAt}
              volume={((agg as any).volumePerToken || 0) / LAMPORTS_PER_SOL}
            />
          ))}
        </div>
        {/* About to Graduate */}
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold mb-2 text-white/80 text-center">
            About to Graduate
          </div>
          {aboutToGraduate.map((agg) => (
            <TokenRow
              key={agg.mint}
              agg={agg}
              onClick={(mint) => {
                setOpen(true)
                setInputs({
                  inputMint: SOL_MINT,
                  outputMint: mint,
                  inputAmount: 0,
                })
              }}
              createdAt={(agg as any).tokenCreatedAt}
              volume={((agg as any).volumePerToken || 0) / LAMPORTS_PER_SOL}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
