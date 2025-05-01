export function TokenBondedBar({ realSolReserves, LAMPORTS_PER_SOL }: { realSolReserves?: string | number, LAMPORTS_PER_SOL: number }) {
  if (!realSolReserves) {
    return <div className="w-full h-3 bg-gray-800 rounded border border-gray-700 flex items-center justify-center text-[9px] text-gray-500">--</div>
  }
  const real = Number(realSolReserves)
  const virt = 74 * LAMPORTS_PER_SOL
  const progress = virt > 0 ? Math.min(real / virt, 1) : 0
  const percent = (progress * 100).toFixed(1)
  return (
    <div className="w-full h-3 bg-gray-800 rounded overflow-hidden border border-gray-700 relative">
      <div style={{ width: `${percent}%` }} className="h-full bg-yellow-400 transition-all"></div>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold" style={{color: progress > 0.5 ? '#000' : '#fff'}}>{percent}%</span>
    </div>
  )
} 