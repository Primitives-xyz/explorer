import { MintAggregate } from './trenches-types'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'

export function TokenIdentity({ agg, symbol, name, image }: { agg: MintAggregate, symbol?: string, name?: string, image?: string }) {
  return (
    <div className="flex flex-row items-start gap-2 min-w-0">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 overflow-hidden">
        {image ? (
          <img src={image} alt={symbol || agg.mint} className="w-12 h-12 object-cover" />
        ) : (
          <span className="font-mono text-xs text-white">{agg.mint.slice(0, 2)}</span>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-white text-sm truncate max-w-[90px]">{name || 'Loading...'}</span>
        <span className="text-xs text-gray-300 truncate max-w-[90px]">{symbol || <SolanaAddressDisplay address={agg.mint} displayAbbreviatedAddress showCopyButton={false} />}</span>
        <span className="text-[10px] text-gray-500 truncate max-w-[90px]">
          <SolanaAddressDisplay address={agg.mint} displayAbbreviatedAddress showCopyButton={true} />
        </span>
      </div>
    </div>
  )
} 