export function TokenVolume({ volume }: { volume?: number }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-[10px] text-gray-400">Volume</span>
      <span className="text-[10px] text-purple-400 font-bold">{volume ? volume.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '--'}</span>
    </div>
  )
} 