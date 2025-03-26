"use client"

import { cn } from "@/utils"
import { ArrowUpDown } from "lucide-react"


interface SwapDividerProps {
  onSwap: () => void
  disabled?: boolean
  className?: string
}

export default function SwapDivider({ onSwap, disabled = false, className }: SwapDividerProps) {
  return (
    <div className={cn("flex items-center justify-between w-full gap-2", className)}>
      <div className="h-px w-5/12 bg-white/20" />
      <button
        type="button"
        onClick={onSwap}
        disabled={disabled}
        className="flex items-center justify-center p-1 rounded-full transition-colors"
        title="Swap direction"
        aria-label="Swap direction"
      >
        <ArrowUpDown
          className={cn(
            "h-5 w-5 text-[#F5F8FD] transition-colors",
            !disabled && "hover:text-[#97EF83]",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        />
      </button>
      <div className="h-px w-5/12 bg-white/20" />
    </div>
  )
}

