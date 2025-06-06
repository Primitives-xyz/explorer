import { Card, CardContent } from '@/components/ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { TokenBadges } from './token-badges'
import { TokenBondedBar } from './token-bonded-bar'
import { TokenBuySellBar } from './token-buy-sell-bar'
import { TokenCreatedTime } from './token-created-time'
import { TokenIdentity } from './token-identity'
import { TokenLiquidityProviders } from './token-liquidity-providers'
import { TokenPrice } from './token-price'
import { TokenRealLiquidity } from './token-real-liquidity'
import { TokenSmallBuy } from './token-small-buy'
import { TokenVolume } from './token-volume'
import { MintAggregate } from './trenches-types'

export function TokenRow({
  agg,
  onClick,
  onBuy,
  createdAt,
  volume,
  currency = 'SOL',
  solPrice = null,
}: {
  agg: MintAggregate
  onClick: () => void
  onBuy: (mint: string, amount: number) => void
  createdAt?: number | null
  volume?: number
  currency?: 'SOL' | 'USD'
  solPrice?: number | null
  disableFlash?: boolean
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
    lastTradePriceSol = agg.pricePerToken.toLocaleString(undefined, {
      maximumFractionDigits: 8,
    })
  }

  return (
    <Card
      onClick={onClick}
      className="w-full overflow-visible transition-all cursor-pointer bg-neutral-900 hover:bg-neutral-800 border-2 border-transparent"
    >
      <CardContent className="w-full px-2 py-2">
        <div
          className="flex flex-col items-stretch h-full justify-between"
          style={{ minHeight: 100 }}
        >
          {/* Top section: left and right columns */}
          <div className="flex flex-row w-full justify-between gap-2">
            {/* Left: Identity and Real Liquidity */}
            <div className="flex flex-col min-w-0 gap-0.5">
              <TokenIdentity
                agg={agg}
                symbol={symbol}
                name={name}
                image={image}
              />
              <TokenRealLiquidity
                realSolReserves={lastTrade?.realSolReserves}
                currency={currency}
                solPrice={solPrice}
              />
              <TokenBadges agg={agg} />
              <div onClick={(e) => e.stopPropagation()}>
                <TokenSmallBuy
                  onBuy={(mint, amount) => {
                    onBuy(mint, amount)
                  }}
                  mint={agg.mint}
                />
              </div>
            </div>
            {/* Right: Price, Top Traders, Created, Volume */}
            <div className="flex flex-col items-end min-w-0 gap-0.5">
              <TokenPrice
                lastTradePriceSol={lastTradePriceSol}
                currency={currency}
                solPrice={solPrice}
              />
              <TokenLiquidityProviders
                topWallets={topWallets}
                totalVolume={totalVolume}
              />
              <TokenCreatedTime createdAt={createdAt} />
              <TokenVolume
                volume={volume}
                currency={currency}
                solPrice={solPrice}
              />
            </div>
          </div>
          {/* Double bars at the bottom */}
          <div className="flex flex-col gap-0.5 mt-1">
            <TokenBuySellBar
              totalBuy={agg.totalBuy}
              totalSell={agg.totalSell}
              decimals={decimals}
            />
            <TokenBondedBar
              realSolReserves={lastTrade?.realSolReserves}
              LAMPORTS_PER_SOL={LAMPORTS_PER_SOL}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
