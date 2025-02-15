import type { PriorityLevelOption } from '@/types/jupiter'

// Platform fee configuration
export const PLATFORM_FEE_BPS = 80 // 0.8% = 80 basis points
export const PLATFORM_FEE_ACCOUNT =
  '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'
export const SSE_TOKEN_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.5% default
export const DEFAULT_PRIORITY_LEVEL = 'Medium'

// Priority level options
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

// Slippage options in basis points
export const SLIPPAGE_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: '0.5%', value: 50 },
  { label: '1.0%', value: 100 },
  { label: '2.0%', value: 200 },
  { label: '5.0%', value: 500 },
  { label: '10.0%', value: 1000 },
  { label: '15.0%', value: 1500 },
]
