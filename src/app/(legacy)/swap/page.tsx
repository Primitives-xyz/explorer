'use client'

import { useState } from "react"
import clsx from "clsx"

import SwapView from "@/components/trade-new-version/swap"
import Perpetual from "@/components/trade-new-version/perpetual"

const Swap = () => {
  const [tradeMode, setTradeMode] = useState("swap")

  const handleModeChange = (mode: string) => {
    setTradeMode(mode)
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-row gap-14 mb-4">
        {["swap", "perpetual"].map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={clsx(
              "text-[20px] font-bold leading-[150%] px-4 py-1 rounded-[20px]",
              tradeMode === mode
                ? "text-[#2A2C31] bg-[#97EF83]"
                : "text-[#F5F8FD]"
            )}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
      {
        (tradeMode == "swap") ? (
          <SwapView />
        ) : (
          <Perpetual />
        )
      }
    </div>
  )
}

export default Swap;