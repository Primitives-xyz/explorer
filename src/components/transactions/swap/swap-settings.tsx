import { getPriorityLevels, SLIPPAGE_OPTIONS } from '@/constants/jupiter'
import type { PriorityLevel } from '@/types/jupiter'
import { useTranslations } from 'next-intl'

interface SwapSettingsProps {
  slippageBps: number | 'auto'
  onSlippageChange: (value: number | 'auto') => void
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
  const t = useTranslations()
  return (
    <div className="flex items-center gap-4 pt-4 border-t border-green-900/20">
      <div className="flex-1">
        <div className="text-sm mb-2">{t('trade.slippage')}</div>
        <select
          className="bg-green-900/20  p-2 rounded w-full"
          value={slippageBps}
          onChange={(e) =>
            onSlippageChange(
              e.target.value === 'auto' ? 'auto' : Number(e.target.value)
            )
          }
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
        <div className="text-sm mb-2">{t('trade.priority')}</div>
        <select
          className="bg-green-900/20  p-2 rounded w-full"
          value={priorityLevel}
          onChange={(e) => onPriorityChange(e.target.value as PriorityLevel)}
          disabled={disabled}
        >
          {getPriorityLevels(t).map((level) => (
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
