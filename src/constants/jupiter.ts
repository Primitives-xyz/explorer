import type { PriorityLevelOption } from '@/types/jupiter'
import { useTranslations } from 'next-intl'

// Platform fee configuration
export const PLATFORM_FEE_BPS = 80 // 0.8% = 80 basis points
export const PLATFORM_FEE_ACCOUNT =
  '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'
export const SSE_TOKEN_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.5% default
export const DEFAULT_PRIORITY_LEVEL = 'Medium'

// Priority level options
export const getPriorityLevels = (): PriorityLevelOption[] => {
  const t = useTranslations()

  return [
    {
      label: t('priority_levels.minimum'),
      value: 'Min',
      description: t('priority_levels.minimum_description'),
    },
    {
      label: t('priority_levels.low'),
      value: 'Low',
      description: t('priority_levels.low_description'),
    },
    {
      label: t('priority_levels.medium'),
      value: 'Medium',
      description: t('priority_levels.medium_description'),
    },
    {
      label: t('priority_levels.high'),
      value: 'High',
      description: t('priority_levels.high_description'),
    },
    {
      label: t('priority_levels.very_high'),
      value: 'VeryHigh',
      description: t('priority_levels.very_high_description'),
    },
    {
      label: t('priority_levels.maximum'),
      value: 'UnsafeMax',
      description: t('priority_levels.maximum_description'),
    },
  ]
}

// Slippage options in basis points
export const SLIPPAGE_OPTIONS = [
  { label: '0.1%', value: 10 },
  { label: '0.5%', value: 50 },
  { label: '1.0%', value: 100 },
  { label: '2.0%', value: 200 },
]
