export function TokenRealLiquidity({ realSolReserves }: { realSolReserves?: string | number }) {
  const value = realSolReserves ? Number(realSolReserves) / 1_000_000_000 : 0
  return (
    <span className="text-[10px] text-green-400 mt-1">Real Liquidity: {value.toFixed(3)} SOL</span>
  )
} 