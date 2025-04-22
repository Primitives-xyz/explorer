'use client'

import { Button, ButtonVariant } from '@/components/ui'
import Slider from '@/components/ui/slider/slider'
import { useCallback, useState } from 'react'

interface Props {
  min: number
  max: number
  leverageValue: number
  setAmount: (value: string) => void
  setLeverageValue: (value: number) => void
  setIsSizeByLeverage: (value: boolean) => void
}

export default function LeverageSelector({
  min,
  max,
  leverageValue,
  setAmount,
  setLeverageValue,
  setIsSizeByLeverage,
}: Props) {
  const [percentage, setPercentage] = useState<number>(0)

  const handlePercentageChange = useCallback(
    (percentage: number) => {
      setPercentage(percentage)
      const newLeverage = (max * percentage) / 100
      setIsSizeByLeverage(true)
      setLeverageValue(newLeverage)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [max]
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p>Leverage</p>
        <p>{leverageValue.toFixed(2)}x</p>
      </div>

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
          {[25, 50, 75, 100].map((percent, index) => (
            <Button
              key={index}
              variant={ButtonVariant.BADGE}
              onClick={() => handlePercentageChange(percent)}
            >
              {percent}%
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
