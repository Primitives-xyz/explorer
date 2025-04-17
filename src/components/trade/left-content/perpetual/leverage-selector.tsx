"use client"

import { Button, ButtonVariant } from "@/components/ui"
import type React from "react"
import Slider from "@/components/ui/slider/slider"

interface LeverageSelectorProps {
  min: number
  max: number
  setAmount: (amount: string) => void
  getSizeByLeveragePercent: (leverage: number) => string
  leverageValue: number
  setLeverageValue: (value: number) => void
}

export default function LeverageSelector({
  min,
  max,
  setAmount,
  getSizeByLeveragePercent,
  leverageValue,
  setLeverageValue
}: LeverageSelectorProps) {

  const handlePercentageClick = (percentage: number) => {
    setAmount(getSizeByLeveragePercent(percentage))
    const newLeverage = (max - min) * (percentage / 100) + min
    setLeverageValue(newLeverage)
  }

  return (
    <div className="w-full space-y-4">
      <Slider
        min={min}
        max={max}
        step={0.1}
        value={[leverageValue]}
        onValueChange={(value) => setLeverageValue(value[0])}
      />

      <div className="grid grid-cols-4 gap-2">
        {
          [25, 50, 75, 100].map((percent, index) => (
            <Button
              key={index}
              variant={ButtonVariant.BADGE}
              className="text-center"
              onClick={() => handlePercentageClick(percent)}
            >
              {percent}%
            </Button>
          ))
        }
      </div>
    </div>
  )
}

