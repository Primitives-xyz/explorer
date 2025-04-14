export function formatSmartNumber(
  input: number | string,
  opts: {
    withComma?: boolean
    compact?: boolean
    micro?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
): string {
  const {
    withComma = false,
    compact = true,
    micro = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 6,
  } = opts

  let value = typeof input === 'string' ? parseFloat(input) : input
  if (isNaN(value)) return '0'

  if (micro) value /= 1_000_000

  if (withComma && !compact) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    })
  }

  if (compact) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  })
}
