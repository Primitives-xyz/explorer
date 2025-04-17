"use client"

import { Button, ButtonVariant } from "@/components/ui"
import type React from "react"
import Slider from "@/components/ui/slider/slider"
import { useCallback, useEffect, useState } from "react"

interface LeverageSelectorProps {
  min: number
  max: number
  setAmount: (amount: string) => void
  leverageValue: number
  setLeverageValue: (value: number) => void
  setIsSizeByLeverage: (value: boolean) => void
}

export default function LeverageSelector({
  min,
  max,
  setAmount,
  leverageValue,
  setLeverageValue,
  setIsSizeByLeverage
}: LeverageSelectorProps) {
  const [percentage, setPercentage] = useState<number>(0)

  const handlePercentageChange = useCallback((percentage: number) => {
    setPercentage(percentage)
    const newLeverage = max * percentage / 100
    setIsSizeByLeverage(true)
    setLeverageValue(newLeverage)
  }, [max])

  return (
    <div className="w-full space-y-4">
      <Slider
        min={min}
        max={max}
        step={0.1}
        value={[leverageValue]}
        onValueChange={(value) => {
          setIsSizeByLeverage(true)
          setLeverageValue(value[0])
        }}
      />

      <div className="grid grid-cols-4 gap-2">
        {
          [25, 50, 75, 100].map((percent, index) => (
            <Button
              key={index}
              variant={ButtonVariant.BADGE}
              className="text-center"
              onClick={() => handlePercentageChange(percent)}
            >
              {percent}%
            </Button>
          ))
        }
      </div>
    </div>
  )
}

