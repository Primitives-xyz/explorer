import { Card, CardContent } from '@/components/ui'
import { useEffect, useRef, useState } from 'react'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { MintAggregate } from './stream-types'
import { formatNumber } from '@/utils/utils'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'

export function TokenRow({ agg, onClick }: { agg: MintAggregate, onClick: (mint: string, tokenInfo: any) => void }) {
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
  console.log('lastTrade', lastTrade)

  // Derived values
  let lastTradePriceSol: string | null = null
  if (lastTrade && lastTrade.tokenAmount && Number(lastTrade.tokenAmount) > 0 && lastTrade.solAmount) {
    const price = Number(lastTrade.solAmount) / Number(lastTrade.tokenAmount)
    lastTradePriceSol = price.toLocaleString(undefined, { maximumFractionDigits: 6 })
  }

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
      className={`w-full transition-all mb-2 ${flash ? 'flash-shake-row flash-shake-row-text-black' : 'bg-neutral-900'} hover:bg-neutral-800 cursor-pointer`}
      style={{ border: flash ? '2px solid #fff700' : '2px solid transparent' }}
      onClick={() => onClick(agg.mint, tokenInfo)}
    >
      <CardContent className="flex flex-row items-center w-full px-4 py-3">
        {/* Image */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mr-4 overflow-hidden">
          {image ? (
            <img src={image} alt={symbol || agg.mint} className="w-10 h-10 object-cover" />
          ) : (
            <span className="font-mono text-xs text-white">{agg.mint.slice(0, 2)}</span>
          )}
        </div>
        {/* Name/Symbol/Mint */}
        <div className="flex flex-col min-w-0 mr-4" style={{ width: 120 }}>
          <span className="font-bold text-white truncate">{name || 'Loading...'}</span>
          <span className="text-xs text-gray-300 truncate">{symbol || <SolanaAddressDisplay address={agg.mint} displayAbbreviatedAddress showCopyButton={false} />}</span>
          <span className="text-xs text-gray-500 truncate"><SolanaAddressDisplay address={agg.mint} displayAbbreviatedAddress showCopyButton={true} /></span>
        </div>
        {/* TPS */}
        <div className="flex flex-col items-center mr-4 min-w-[60px]">
          <span className="text-xs text-gray-400">TPS</span>
          <span className="font-bold text-yellow-400 text-lg">{(agg.tps || 0).toFixed(2)}</span>
        </div>
        {/* Buy/Sell Bar */}
        <div className="flex flex-col items-center mr-4 min-w-[120px]">
          <span className="text-xs text-gray-400 mb-1">Buy/Sell</span>
          <div className="relative w-28 h-4 rounded overflow-hidden flex flex-row border border-gray-700 bg-gray-800">
            {(() => {
              const total = agg.totalBuy + agg.totalSell
              const buyPercent = total > 0 ? agg.totalBuy / total : 0.5
              const sellPercent = total > 0 ? agg.totalSell / total : 0.5
              return <>
                <div style={{ width: `${buyPercent * 100}%` }} className="h-full bg-green-500 transition-all"></div>
                <div style={{ width: `${sellPercent * 100}%` }} className="h-full bg-red-500 transition-all"></div>
              </>
            })()}
          </div>
          <div className="flex flex-row justify-between w-28 text-xs mt-1">
            <span className="text-green-400 font-bold">{formatNumber(agg.totalBuy / 10 ** decimals)}</span>
            <span className="text-red-400 font-bold">{formatNumber(agg.totalSell / 10 ** decimals)}</span>
          </div>
        </div>
        {/* Bonding Progress Bar */}
        <div className="flex flex-col items-center mr-4 min-w-[120px]">
          <span className="text-xs text-gray-400 mb-1">Bonded</span>
          {lastTrade && lastTrade.realSolReserves && lastTrade.virtualSolReserves ? (
            (() => {
              const real = Number(lastTrade.realSolReserves)
              const virt = Number(lastTrade.virtualSolReserves)
              const progress = virt > 0 ? Math.min(real / virt, 1) : 0
              const percent = (progress * 100).toFixed(1)
              return (
                <div className="w-28 h-3 bg-gray-800 rounded overflow-hidden border border-gray-700 relative">
                  <div style={{ width: `${percent}%` }} className="h-full bg-yellow-400 transition-all"></div>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold" style={{color: progress > 0.5 ? '#000' : '#fff'}}>{percent}%</span>
                </div>
              )
            })()
          ) : (
            <div className="w-28 h-3 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-xs text-gray-500">--</div>
          )}
        </div>
        {/* Price */}
        <div className="flex flex-col items-center mr-4 min-w-[80px]">
          <span className="text-xs text-gray-400">Price</span>
          <span className="font-bold text-blue-400">
            {lastTradePriceSol ? `${lastTradePriceSol} SOL` : '--'}
          </span>
        </div>
        {/* Recent Trade */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs text-gray-400">Recent Trade</span>
          {lastTrade ? (
            <span className="truncate text-sm">
              <span className={lastTrade.isBuy ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{lastTrade.isBuy ? 'Buy' : 'Sell'}</span>{' '}
              <span className="text-white font-mono">{formatNumber(Number(lastTrade.solAmount) / 10 ** decimals)}</span>{' '}
              <span className="text-gray-400">by <SolanaAddressDisplay address={lastTrade.user} displayAbbreviatedAddress showCopyButton={true} /></span>{' '}
              <span className="text-gray-500">{new Date(Number(lastTrade.timestamp) * 1000).toLocaleTimeString()}</span>
            </span>
          ) : (
            <span className="text-gray-500">--</span>
          )}
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