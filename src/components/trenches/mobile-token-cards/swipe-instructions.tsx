'use client'

import { ArrowDown, ArrowLeft, ArrowUp, Flame } from 'lucide-react'

export function SwipeInstructions() {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 text-xs text-gray-400">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <ArrowUp size={14} />
          <span>Next</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowDown size={14} />
          <span>Previous</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowLeft size={14} />
          <span>Details</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
        <Flame size={12} />
        <span>Tap flame button to close</span>
      </div>
    </div>
  )
}
