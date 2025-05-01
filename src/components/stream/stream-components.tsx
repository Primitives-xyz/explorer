import { Card, CardContent } from '@/components/ui'
import { useEffect, useRef, useState } from 'react'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { MintAggregate } from './stream-types'
import { formatNumber, formatTimeAgo } from '@/utils/utils'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { useIsMobile } from '@/utils/use-is-mobile'
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

export function TokenRow({ agg, onClick, createdAt, volume }: { agg: MintAggregate, onClick: (mint: string) => void, createdAt?: number | null, volume?: number }) {
  const { isMobile } = useIsMobile()
  const tokenInfo = useTokenInfo(agg.mint)
  const loading = tokenInfo.loading
  const symbol = tokenInfo.symbol
  const name = tokenInfo.name
  const image = tokenInfo.image
  const price = tokenInfo.data?.result && 'token_info' in tokenInfo.data.result
    ? tokenInfo.data.result.token_info?.price_info?.price_per_token
    : undefined
  const decimals = tokenInfo.decimals ?? 9
  const lastTrade = agg.lastTrade?.eventData?.tradeEvents?.[0]
  const uniqueTraderCount = (agg as any).uniqueTraders ? (agg as any).uniqueTraders.size : 0
  const topWallets = (agg as any).walletVolumes
    ? Object.entries((agg as any).walletVolumes)
        .map(([wallet, stats]: [string, any]) => ({ wallet, totalVolume: stats.totalVolume }))
        .sort((a, b) => b.totalVolume - a.totalVolume)
        .slice(0, 3)
    : []
  const totalVolume = (agg as any).volumePerToken || 0

  // Derived values
  let lastTradePriceSol: string | null = null
  if (lastTrade && lastTrade.tokenAmount && Number(lastTrade.tokenAmount) > 0 && lastTrade.solAmount) {
    const price = Number(lastTrade.solAmount) / Number(lastTrade.tokenAmount)
    lastTradePriceSol = price.toLocaleString(undefined, { maximumFractionDigits: 6 })
  }

  // Calculate real liquidity in SOL
  const realLiquidity = lastTrade && lastTrade.realSolReserves ? Number(lastTrade.realSolReserves) : 0

  // Animation state
  const [flash, setFlash] = useState(false)
  const lastUpdateRef = useRef<number | undefined>(agg.lastUpdate)

  useEffect(() => {
    if (agg.lastUpdate && agg.lastUpdate !== lastUpdateRef.current) {
      setFlash(true)
      lastUpdateRef.current = agg.lastUpdate
      const timeout = setTimeout(() => setFlash(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [agg.lastUpdate])

  return (
    <Card
      className={`w-full overflow-visible transition-all mb-2 ${flash ? 'flash-shake-row flash-shake-row-text-black' : 'bg-neutral-900'} hover:bg-neutral-800 cursor-pointer`}
      style={{ border: flash ? '2px solid #fff700' : '2px solid transparent' }}
      onClick={() => onClick(agg.mint)}
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
              <TokenIdentity agg={agg} tokenInfo={tokenInfo} />
              <TokenRealLiquidity realSolReserves={lastTrade?.realSolReserves} />
              <TokenBadges agg={agg} />
            </div>
            {/* Right: Price, Top Traders, Created, Volume */}
            <div className="flex flex-col items-end min-w-0 gap-1">
              <TokenPrice lastTradePriceSol={lastTradePriceSol} />
              <TokenLiquidityProviders topWallets={topWallets} totalVolume={totalVolume} />
              <TokenCreatedTime createdAt={createdAt} />
              <TokenVolume volume={volume} />
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