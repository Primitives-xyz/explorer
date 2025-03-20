"use client"

import { Badge } from "@/components-new-version/ui"
import type React from "react"

import { useState } from "react"

interface LeverageSelectorProps {
  defaultValue?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
}

export default function LeverageSelector({ defaultValue = 19.4, min = 1, max = 100, onChange }: LeverageSelectorProps) {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseFloat(e.target.value)
    setValue(newValue)
    onChange?.(newValue)
  }

  const handlePercentageClick = (percentage: number) => {
    const newValue = (max - min) * (percentage / 100) + min
    setValue(newValue)
    onChange?.(newValue)
  }

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      <div className="relative mb-8 pt-2">
        <div className="absolute h-1 w-full flex flex-row bg-green-100/10 rounded-full">
          <div className="absolute top-1/2 h-[16px] w-1 bg-green-400 -translate-y-1/2"></div>
          <div className="absolute h-1 bg-green-400 rounded-full" style={{ width: `${percentage}%` }} />
          <div className="absolute top-1/2 right-0 h-[16px] w-1 bg-green-100/10 -translate-y-1/2"></div>
        </div>

        <div className="absolute -mt-3 -ml-10 flex items-center justify-center" style={{ left: `${percentage}%` }}>
          <div className="px-[10px] py-1 bg-[#5d6a54] border border-[#97EF83] rounded-full text-white font-medium text-sm">
            {value.toFixed(2)}x
          </div>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={value}
          onChange={handleChange}
          className="absolute w-full opacity-0 cursor-pointer h-6"
        />
      </div>

      <div className="flex justify-between gap-2 mt-8">
        {[25, 50, 75, 100].map((percent, index) => (
          <Badge
            key={index}
            className='text-[#97EF83] border-[#97EF83] cursor-pointer px-6 py-1 rounded-[6px] text-[16px] font-bold'
            onClick={() => handlePercentageClick(percent)}
          >{percent}%</Badge>
        ))}
      </div>
    </div>
  )
}

