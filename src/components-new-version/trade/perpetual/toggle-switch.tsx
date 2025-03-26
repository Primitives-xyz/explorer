"use client"

import { useState } from "react"
import { cn } from '@/utils'

interface ToggleSwitchProps {
  defaultValue?: "long" | "short"
  onChange?: (value: "long" | "short") => void
}

export default function ToggleSwitch({ defaultValue = "long", onChange }: ToggleSwitchProps) {
  const [selected, setSelected] = useState<"long" | "short">(defaultValue)

  const handleToggle = (value: "long" | "short") => {
    setSelected(value)
    onChange?.(value)
  }

  return (
    <div className="flex w-full rounded-full bg-white/5 border border-white/20">
      <button
        onClick={() => handleToggle("long")}
        className={cn(
          "flex-1 rounded-full py-2 text-center font-bold transition-all text-[20px]",
          selected === "long" ? "bg-[#97EF83] text-[#292c31]" : "bg-transparent text-[#97EF83]",
        )}
      >
        Long
      </button>
      <button
        onClick={() => handleToggle("short")}
        className={cn(
          "flex-1 rounded-full py-2 text-center font-bold transition-all text-[20px]",
          selected === "short" ? "bg-[#97EF83] text-[#292c31]" : "bg-transparent text-[#97EF83]",
        )}
      >
        Short
      </button>
    </div>
  )
}

