'use client'

import { QuoteResponse } from "@/types/jupiter"
import { formatLargeNumber } from "@/utils/format"
import { Circle } from "lucide-react"
import Image from "next/image"

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


  const platforms = jupiterSwapResponse ? jupiterSwapResponse.routePlan.map((router) => ({
    name: router.swapInfo.label,
    logo: router.swapInfo.label,
    price: formatLargeNumber(
      Number.parseFloat(router.swapInfo.outAmount) / Math.pow(10, outputTokenDecimals),
      outputTokenDecimals
    )
  })) : []

  platforms.push({
    name: 'sse',
    logo: 'sse',
    price: formatLargeNumber(Number.parseFloat(platformExpectedOutAmount), outputTokenDecimals)
  })

  platforms.sort((router1, router2) => Number.parseFloat(router1.price) - Number.parseFloat(router2.price));

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

function PlatformLogo({ name }: { name: string }) {
  switch (name.toLowerCase()) {
    case "sse":
      return (
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
          <Image 
            src="/dexlogos/sse.svg"
            alt="sse"
            width={20}
            height={20}
          />
        </div>
      )
    case "raydium":
      return (
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
          <Image 
            src="/dexlogos/raydium.svg"
            alt="sse"
            width={20}
            height={20}
          />
        </div>
      )
    case "orca":
      return (
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
          <Image 
            src="/dexlogos/orca.svg"
            alt="sse"
            width={20}
            height={20}
          />
        </div>
      )
    case "meteora dlmm":
      return (
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
          <Image 
            src="/dexlogos/meteora.png"
            alt="jupiter"
            width={20}
            height={20}
          />
        </div>
      )
    case "phantom":
      return (
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
          <Image 
            src="/dexlogos/phantom.svg"
            alt="phantom"
            width={20}
            height={20}
          />
        </div>
      )
    case "backpack":
      return (
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
          <Image 
            src="/dexlogos/backpack.svg"
            alt="backpack"
            width={20}
            height={20}
          />
        </div>
      )
    case "photon":
      return (
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
          <Image 
            src="/dexlogos/photon.svg"
            alt="photon"
            width={20}
            height={20}
          />
        </div>
      )
    case "bullx":
      return (
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
          <Image 
            src="/dexlogos/bullux.svg"
            alt="bullux"
            width={20}
            height={20}
          />
        </div>
      )
    case "axiom":
      return (
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
          <Image 
            src="/dexlogos/axiom.svg"
            alt="axiom"
            width={20}
            height={20}
          />
        </div>
      )
    default:
      return <Circle className="w-8 h-8 text-gray-400" />
  }
}