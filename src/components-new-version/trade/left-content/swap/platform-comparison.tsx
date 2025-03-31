'use client'

import { useMemo } from "react"

import { QuoteResponse } from "@/components-new-version/types/jupiter"
import { formatLargeNumber } from "@/components-new-version/utils/format"
import { PlatformLogo } from "./platform-logo"

interface PlatformComparisonProps {
  jupiterSwapResponse: QuoteResponse | null
  outputTokenSymbol?: string
  outputTokenDecimals?: number
  platformExpectedOutAmount: string
}

export default function PlatformComparison({
  jupiterSwapResponse,
  outputTokenSymbol,
  outputTokenDecimals = 6,
  platformExpectedOutAmount
}: PlatformComparisonProps) {

  const platforms = useMemo(() => {
    if (!jupiterSwapResponse) return []

    // Create platforms array from Jupiter response
    const platformsFromResponse = jupiterSwapResponse.routePlan.map((router) => ({
      name: router.swapInfo.label,
      logo: router.swapInfo.label,
      price: formatLargeNumber(
        Number.parseFloat(router.swapInfo.outAmount) / Math.pow(10, outputTokenDecimals),
        outputTokenDecimals,
      ),
    }))

    // Add SSE platform
    const allPlatforms = [
      ...platformsFromResponse,
      {
        name: "sse",
        logo: "sse",
        price: formatLargeNumber(Number.parseFloat(platformExpectedOutAmount), outputTokenDecimals),
      },
    ]

    // Sort by price (ascending)
    return allPlatforms.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price))
  }, [jupiterSwapResponse, platformExpectedOutAmount, outputTokenDecimals])

  if (!jupiterSwapResponse) return null

  return (
    <div className="px-2">
      <div className="space-y-4">
        {platforms.map((platform) => (
          <div key={platform.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlatformLogo name={platform.logo} />
              <span className="text-white font-medium uppercase">{platform.name}</span>
            </div>
            <div className="flex flex-row justify-center items-end gap-1">
              <span className="text-white font-medium">{platform.price.slice(0, platform.price.indexOf(".") + 3)}</span>
              <span className="text-[#97EF83]">${outputTokenSymbol}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}