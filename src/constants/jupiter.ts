import type { PriorityLevelOption } from '@/types/jupiter'

// Platform fee configuration
export const PLATFORM_FEE_BPS = 100 // 1% = 100 basis points
export const PLATFORM_FEE_ACCOUNT =
  '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.5% default
export const DEFAULT_PRIORITY_LEVEL = 'Medium'

export const PRIORITY_LEVELS: PriorityLevelOption[] = [
  {
    label: 'Minimum',
    value: 'Min',
    description: 'Lowest fees, may fail during congestion',
  },
  {
    label: 'Low',
    value: 'Low',
    description: 'Lower fees, suitable for non-urgent swaps',
  },
  {
    label: 'Medium',
    value: 'Medium',
    description: 'Balanced fees and success rate',
  },
  {
    label: 'High',
    value: 'High',
    description: 'Higher fees, better success rate',
  },
  {
    label: 'Very High',
    value: 'VeryHigh',
    description: 'Very high fees, best for urgent swaps',
  },
  {
    label: 'Maximum',
    value: 'UnsafeMax',
    description: 'Highest fees, use with caution',
  },
]

export const SLIPPAGE_OPTIONS = [
  { value: 10, label: '0.1%' },
  { value: 50, label: '0.5%' },
  { value: 100, label: '1.0%' },
  { value: 200, label: '2.0%' },
]
