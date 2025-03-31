'use client'

import { BirdeyeTokenOverview } from "@/components-new-version/hooks/use-birdeye-token-overview"
import { useTokenHolders } from "@/components-new-version/hooks/use-token-holders"
import { formatNumber, shortenAddress } from "@/components-new-version/utils/format"
import { CopyPaste } from "@/components/common/copy-paste"
import { Loader2 } from "lucide-react"

interface TokenHoldersTabProps {
  id: string
  overview?: BirdeyeTokenOverview,
}

export function TokenHoldersTabContent({ id, overview }: TokenHoldersTabProps) {
  const { holdersLoading, holders } = useTokenHolders(id)
  return (
    <div className="h-full">
      <div className="grid grid-cols-3 px-6 py-4 text-white text-[12px] font-bold leading-[150%] capitalize">
        <div>Trader</div>
        <div className="text-right">% Owned</div>
        <div className="text-right">Amount</div>
      </div>
      <div className="h-[250px] overflow-auto">
        {
          !holdersLoading ? (
            <div className="flex flex-col gap-2">
              {holders.map((holder, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 px-4 py-2 rounded-[12px] border border-[rgba(197,192,255,0.10)] bg-[rgba(197,192,255,0.10)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-semibold">
                      #{index + 1}
                    </div>

                    <div className="flex flex-col">
                      {holder.address && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-300">{shortenAddress(holder.address)}</span>
                          <div className="text-zinc-400 hover:text-zinc-300">
                            <CopyPaste content={holder.address} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-zinc-300 self-center">{overview ? ((Number(holder.uiAmountString) / overview.supply) * 100).toFixed(2) + "%" : "N/A"}</div>

                  <div className="text-right text-zinc-300 self-center">{formatNumber(holder.uiAmountString)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <Loader2 className="animate-spin w-10 h-10" />
            </div>
          )
        }
      </div>
    </div>
  )
}
