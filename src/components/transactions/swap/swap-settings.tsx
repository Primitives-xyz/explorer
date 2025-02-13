import { PRIORITY_LEVELS, SLIPPAGE_OPTIONS } from '@/constants/jupiter'
import type { PriorityLevel } from '@/types/jupiter'

interface SwapSettingsProps {
  slippageBps: number
  onSlippageChange: (value: number) => void
  priorityLevel: PriorityLevel
  onPriorityChange: (value: PriorityLevel) => void
  disabled?: boolean
}

export function SwapSettings({
  slippageBps,
  onSlippageChange,
  priorityLevel,
  onPriorityChange,
  disabled,
}: SwapSettingsProps) {
  return (
    <div className="flex items-center gap-4 pt-4 border-t border-green-900/20">
      <div className="flex-1">
        <div className="text-sm  mb-2">Slippage</div>
        <select
          className="bg-green-900/20  p-2 rounded w-full"
          value={slippageBps}
          onChange={(e) => onSlippageChange(Number(e.target.value))}
          disabled={disabled}
        >
          {SLIPPAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <div className="text-sm  mb-2">Priority</div>
        <select
          className="bg-green-900/20  p-2 rounded w-full"
          value={priorityLevel}
          onChange={(e) => onPriorityChange(e.target.value as PriorityLevel)}
          disabled={disabled}
        >
          {PRIORITY_LEVELS.map((level) => (
            <option
              key={level.value}
              value={level.value}
              title={level.description}
            >
              {level.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
