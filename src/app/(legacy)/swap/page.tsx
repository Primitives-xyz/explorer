'use client'

import { useState } from "react"
import clsx from "clsx"

import SwapView from "@/components/trade-new-version/swap"
import Perpetual from "@/components/trade-new-version/perpetual"

type TradeMode = "spot" | "perpetual"

const TradeView = () => {
  const [tradeMode, setTradeMode] = useState<TradeMode>("spot")

  const tradeModes: TradeMode[] = ["spot", "perpetual"]

  return (
    <div className="w-full h-full">
      <div className="flex flex-row gap-14 mb-4">
        {tradeModes.map((mode, index) => (
          <button
            key={index}
            onClick={() => setTradeMode(mode)}
            className={clsx(
              "text-[14px] font-bold leading-[150%] px-4 py-1 rounded-[20px] transition-colors",
              tradeMode === mode ? "text-[#2A2C31] bg-[#97EF83]" :
              "text-[#F5F8FD]",
            )}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {tradeMode === "spot" ? <SwapView /> : <Perpetual />}
    </div>
  )
}

export default TradeView;