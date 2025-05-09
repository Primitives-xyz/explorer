import { Card, CardContent } from '@/components/ui'
import { useEffect, useRef, useState } from 'react'
import { MintAggregate } from './stream-types'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { TokenIdentity } from './token-identity'
import { TokenPrice } from './token-price'
import { TokenLiquidityProviders } from './token-liquidity-providers'
import { TokenCreatedTime } from './token-created-time'
import { TokenVolume } from './token-volume'
import { TokenRealLiquidity } from './token-real-liquidity'
import { TokenBuySellBar } from './token-buy-sell-bar'
import { TokenBondedBar } from './token-bonded-bar'
import { TokenBadges } from './token-badges'
import { TokenSmallBuy } from './token-small-buy'

export function TokenRow({ agg, onClick, createdAt, volume, currency = 'SOL', solPrice = null, disableFlash = false, variant, className }: {
  agg: MintAggregate,
  onClick: (mint: string, amount: number) => void,
  createdAt?: number | null,
  volume?: number,
  currency?: 'SOL' | 'USD',
  solPrice?: number | null,
  disableFlash?: boolean,
  variant?: 'default' | 'accent' | 'accent-social',
  className?: string
}) {
  const symbol = agg.mintSymbol
  const name = agg.mintName
  const image = agg.mintImage
  const decimals = agg.decimals ?? 9
  const lastTrade = agg.lastTrade?.eventData?.tradeEvents?.[0]
  const topWallets = agg.topWallets || []
  const totalVolume = agg.volumePerToken || 0

  // Use pricePerToken from agg
  let lastTradePriceSol: string | null = null
  if (agg.pricePerToken != null) {
    lastTradePriceSol = agg.pricePerToken.toLocaleString(undefined, { maximumFractionDigits: 8 })
  }

  // Animation state
  const [flash, setFlash] = useState(false)
  const lastUpdateRef = useRef<number | undefined>(agg.lastUpdate)

  useEffect(() => {
    if (disableFlash) {
      setFlash(false)
      lastUpdateRef.current = agg.lastUpdate
      return
    }
    if (agg.lastUpdate && agg.lastUpdate !== lastUpdateRef.current) {
      setFlash(true)
      lastUpdateRef.current = agg.lastUpdate
      const timeout = setTimeout(() => setFlash(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [agg.lastUpdate, disableFlash])

  // Remove onClick from Card, move buy logic to button
  return (
    <Card
      variant={variant}
      className={`w-full overflow-visible transition-all mb-2 ${flash ? 'flash-shake-row flash-shake-row-text-black' : 'bg-neutral-900'} hover:bg-neutral-800 ${className || ''}`}
      style={{ border: flash ? '2px solid #fff700' : '2px solid transparent' }}
    >
      <CardContent className="w-full px-2 py-2">
        <div
          className="flex flex-col items-stretch h-full justify-between"
          style={{ minHeight: 120 }}
        >
          {/* Top section: left and right columns */}
          <div className="flex flex-row w-full justify-between gap-2">
            {/* Left: Identity and Real Liquidity */}
            <div className="flex flex-col min-w-0 gap-1">
              <TokenIdentity agg={agg} symbol={symbol} name={name} image={image} />
              <TokenRealLiquidity realSolReserves={lastTrade?.realSolReserves} currency={currency} solPrice={solPrice} />
              <TokenBadges agg={agg} />
              <TokenSmallBuy onBuy={(mint, amount) => { onClick(mint, amount); }} mint={agg.mint} />
            </div>
            {/* Right: Price, Top Ruggers, Created, Volume */}
            <div className="flex flex-col items-end min-w-0 gap-1">
              <TokenPrice lastTradePriceSol={lastTradePriceSol} currency={currency} solPrice={solPrice} />
              <TokenLiquidityProviders walletRugIncentive={agg.walletRugIncentive} />
              <TokenCreatedTime createdAt={createdAt} />
              <TokenVolume volume={volume} currency={currency} solPrice={solPrice} />
            </div>
          </div>
          {/* Double bars at the bottom */}
          <div className="flex flex-col gap-1 mt-2">
            <TokenBuySellBar totalBuy={agg.totalBuy} totalSell={agg.totalSell} decimals={decimals} />
            <TokenBondedBar realSolReserves={lastTrade?.realSolReserves} LAMPORTS_PER_SOL={LAMPORTS_PER_SOL} />
          </div>
        </div>
      </CardContent>
      {/* Animation style */}
      <style>{`
        .flash-shake-row {
          background: #fff700 !important;
          animation: flash-shake-row 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        .flash-shake-row-text-black * {
          color: #000 !important;
        }
        @keyframes flash-shake-row {
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
          100% { background: #18181b; transform: none; }
        }
      `}</style>
    </Card>
  )
} 