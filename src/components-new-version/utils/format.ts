export const formatNumber = (value: string) => {
  const num = parseFloat(value)
  if (isNaN(num)) return '0'

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M'
  }

  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K'
  }

  return num.toFixed(Math.min(2, value.split('.')[1]?.length || 0))
}

export function formatUsdValue(value: number | null) {
  if (value === null || isNaN(value)) return '$0.00'

  // For very small values, show more precision
  if (value !== 0 && Math.abs(value) < 0.01) {
    return `$${value.toFixed(6)}`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatRawAmount(rawAmount: bigint, decimals: bigint) {
  try {
    if (rawAmount === 0n) return '0'

    const divisor = 10n ** decimals
    const integerPart = rawAmount / divisor
    const fractionPart = rawAmount % divisor

    if (fractionPart === 0n) {
      return integerPart.toString()
    }

    // Convert to string and pad with zeros
    let fractionStr = fractionPart.toString()
    while (fractionStr.length < Number(decimals)) {
      fractionStr = '0' + fractionStr
    }

    // Remove trailing zeros
    fractionStr = fractionStr.replace(/0+$/, '')

    return fractionStr
      ? `${integerPart}.${fractionStr}`
      : integerPart.toString()
  } catch (err) {
    console.error('Error formatting amount:', err)
    return '0'
  }
}

export function formatLargeNumber(
  num: number,
  tokenDecimals: number | undefined
) {
  if (num !== 0 && Math.abs(num) < 0.0001) {
    return num.toExponential(4)
  }
  const decimals = tokenDecimals ?? 6
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
}
