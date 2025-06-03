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

  // Validate and clamp fraction digits to valid range (0-20)
  const clampedMinFractionDigits = Math.max(
    0,
    Math.min(20, minimumFractionDigits)
  )
  const clampedMaxFractionDigits = Math.max(
    0,
    Math.min(20, maximumFractionDigits)
  )

  // Ensure minimumFractionDigits is not greater than maximumFractionDigits
  const validMinFractionDigits = Math.min(
    clampedMinFractionDigits,
    clampedMaxFractionDigits
  )
  const validMaxFractionDigits = Math.max(
    clampedMinFractionDigits,
    clampedMaxFractionDigits
  )

  if (withComma && !compact) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: validMinFractionDigits,
      maximumFractionDigits: validMaxFractionDigits,
    })
  }

  if (compact) {
    if (value >= 1_000_000)
      return `${(value / 1_000_000).toFixed(
        Math.min(2, validMaxFractionDigits)
      )}M`
    if (value >= 1_000)
      return `${(value / 1_000).toFixed(Math.min(2, validMaxFractionDigits))}K`
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: validMinFractionDigits,
    maximumFractionDigits: validMaxFractionDigits,
  })
}
