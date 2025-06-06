import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export function TokenRealLiquidity({
  realSolReserves,
  currency = 'SOL',
  solPrice = null,
}: {
  realSolReserves?: string | number
  currency?: 'SOL' | 'USD'
  solPrice?: number | null
}) {
  // Check if realSolReserves is null, undefined, or 0
  if (!realSolReserves || Number(realSolReserves) === 0) {
    return (
      <span className="text-[10px] text-gray-500 mt-1">
        Real Liquidity: Unknown
      </span>
    )
  }

  const value = Number(realSolReserves) / LAMPORTS_PER_SOL
  let display = `${value.toFixed(3)} SOL`
  if (currency === 'USD' && solPrice) {
    display = `$${(value * solPrice).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`
  }
  return (
    <span className="text-[10px] text-green-400 mt-1">
      Real Liquidity: {display}
    </span>
  )
}
