'use client'

import { formatNumber } from "@/components-new-version/utils/utils"
import { CopyPaste } from "@/components/common/copy-paste"
import { useBirdeyeTokenOverview } from "@/hooks/use-birdeye-token-overview"
import { shortenAddress } from "@/utils/format"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

enum TokenDetailsFilter {
  About = "About",
  Holders = "Token Holders",
  Markets = "Markets"
}

interface TokenDetailsProps {
  id: string
  description: string
  decimals: number
  tokenProgram: string
  filter: TokenDetailsFilter
}

interface TokenHolder {
  address: string
  amount: string
  uiAmountString: string
}

const TokenDetails = ({ id, description, decimals, tokenProgram, filter }: TokenDetailsProps) => {
  const { overview, isLoading } = useBirdeyeTokenOverview(id)
  const [holders, setHolders] = useState<TokenHolder[]>([])
  const [holdersLoading, setHoldersLoading] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      try {
        setHoldersLoading(true)
        const response = await fetch(`/api/tokens/largest-holders?mintAddress=${id}`)
        const holders = await response.json().then((data) => data.holders)
        console.log("=======================================================")
        console.log("holders:", holders)
        setHolders(holders)
      } catch (error) {
        console.error('Error fetching token holders:', error)
      } finally {
        setHoldersLoading(false)
      }
    })()

  }, [id])
  return (
    <div className="h-[300px]">
      {
        filter == TokenDetailsFilter.About && (
          <div className="h-full overflow-y-auto">
            <div className="flex justify-between gap-4 items-center my-4">
              <div className="text-gray-200">{description}</div>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[rgba(151,239,131,0.2)] border border-[rgba(151,239,131,0.2)] shadow-[0px_0px_4.6px_0px_rgba(151,239,131,0.2)] backdrop-blur-md">
                  <div className="text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-300 text-sm">{overview?.extensions.website}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[rgba(151,239,131,0.2)] border border-[rgba(151,239,131,0.2)] shadow-[0px_0px_4.6px_0px_rgba(151,239,131,0.2)] backdrop-blur-md">
                  <div className="text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                    </svg>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-300 text-sm">{overview?.extensions.twitter}</span>
                </div>
              </div>
            </div>

            {/* Market Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-200 mb-3">Market Info</h3>
              <div className="bg-[#3a5a3a] text-[14px] rounded-lg overflow-hidden">
                <div className="grid grid-cols-2 py-3 px-4 border-b border-[#4a6a4a]">
                  <span className="text-white font-normal leading-[150%]">Decimals</span>
                  <span className="text-right text-gray-200">{decimals}</span>
                </div>

                <div className="grid grid-cols-2 py-3 px-4 border-b border-[#4a6a4a]">
                  <span className="text-white font-normal leading-[150%]">Token Program</span>
                  <span className="text-right text-gray-200 truncate">{tokenProgram}</span>
                </div>

                <div className="grid grid-cols-2 py-3 px-4 border-b border-[#4a6a4a]">
                  <span className="text-white font-normal leading-[150%]">Markets</span>
                  <span className="text-right text-gray-200">{overview ? overview.numberMarkets : "None"}</span>
                </div>

                <div className="grid grid-cols-2 py-3 px-4 border-b border-[#4a6a4a]">
                  <span className="text-white font-normal leading-[150%]">Circulating Supply</span>
                  <span className="text-right text-gray-200">{formatNumber(overview ? overview.circulatingSupply : 0)}</span>
                </div>

                <div className="grid grid-cols-2 py-3 px-4">
                  <span className="text-white font-normal leading-[150%]">Total Supply</span>
                  <span className="text-right text-gray-200">{overview ? overview.supply : "None"}</span>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        filter == TokenDetailsFilter.Holders && (
          <div className="h-full">
            {/* Header */}
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

                        <div className="text-right text-zinc-300 self-center">{overview ? (Number(holder.uiAmountString) / 100000000000000) * 100 : "N/A"}</div>

                        <div className="text-right text-zinc-300 self-center">{formatNumber(Number.parseFloat(holder.uiAmountString))}</div>
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

      {
        filter == TokenDetailsFilter.Markets && (
          <div className="w-full h-full flex justify-center items-center">Comming Soon...</div>
        )
      }
    </div>
  )
}

export default TokenDetails