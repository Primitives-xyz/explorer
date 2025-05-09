export function TokenVolume({ volume, currency = 'SOL', solPrice = null }: { volume?: number, currency?: 'SOL' | 'USD', solPrice?: number | null }) {
  let display = '--'
  if (volume !== undefined && volume !== null) {
    if (currency === 'USD' && solPrice) {
      display = `$${(volume * solPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    } else {
      display = volume.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
  }
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-[10px] text-gray-400">Volume</span>
      <span className="text-[10px] text-purple-400 font-bold">{display}</span>
    </div>
  )
} 