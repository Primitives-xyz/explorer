import { useState } from 'react'
import { Button } from '@/components/ui/button/button'

export function TokenPrice({ lastTradePriceSol, currency = 'USD', solPrice = null }: { lastTradePriceSol: string | null, currency?: 'SOL' | 'USD', solPrice?: number | null }) {
  const [showMarketCap, setShowMarketCap] = useState(true)
  let display = '--'
  let label = 'Market Cap'
  let priceNum = 0
  let priceDisplayNum = 0
  // console.log('lastTradePriceSol', lastTradePriceSol)
  if (lastTradePriceSol) {
    priceNum = Number(lastTradePriceSol.replace(/,/g, ''))
    priceDisplayNum = currency === 'USD' && solPrice ? priceNum * solPrice : priceNum
    const decimals = priceDisplayNum < 0.01 ? 8 : 2
    if (showMarketCap && priceNum > 0) {
      let marketCap = priceNum * 1_000_000_000
      let marketCapDisplayNum = currency === 'USD' && solPrice ? marketCap * solPrice : marketCap
      const decimals = marketCapDisplayNum < 0.01 ? 8 : 2
      if (currency === 'USD' && solPrice) {
        display = `$${marketCapDisplayNum.toLocaleString(undefined, { maximumFractionDigits: decimals })}`
      } else {
        display = `${marketCapDisplayNum.toLocaleString(undefined, { maximumFractionDigits: decimals })} SOL`
      }
    } else {
      label = 'Price'
      if (currency === 'USD' && solPrice) {
        display = `$${priceDisplayNum.toLocaleString(undefined, { maximumFractionDigits: decimals })}`
      } else {
        display = `${priceNum.toLocaleString(undefined, { maximumFractionDigits: decimals })} SOL`
      }
    }
  }
  return (
    <Button
      variant="ghost"
      className="flex flex-row items-center gap-2 px-0 py-0 min-h-0 min-w-0 h-auto text-left"
      onClick={() => setShowMarketCap((v) => !v)}
      type="button"
      tabIndex={0}
    >
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="font-bold text-blue-400 text-xs">{display}</span>
    </Button>
  )
} 