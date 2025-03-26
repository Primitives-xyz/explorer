export function formatNumber(num: number, precision?: number): string {
  if (num === undefined || num === null) return '0'

  const isNegative = num < 0
  const absNum = Math.abs(num)

  // Handle very small numbers
  if (absNum < 0.00001) {
    return isNegative ? '>-0.00001' : '<0.00001'
  }

  // Handle large numbers
  if (absNum >= 1_000_000_000) {
    return (isNegative ? '-' : '') + (absNum / 1_000_000_000).toFixed(2) + 'B'
  }
  if (absNum >= 1_000_000) {
    return (isNegative ? '-' : '') + (absNum / 1_000_000).toFixed(2) + 'M'
  }
  if (absNum >= 1_000) {
    return (isNegative ? '-' : '') + (absNum / 1_000).toFixed(2) + 'K'
  }

  // Handle precision
  if (precision !== undefined) {
    return (isNegative ? '-' : '') + absNum.toFixed(precision)
  }

  // Dynamic precision based on number size
  if (absNum < 0.01) return (isNegative ? '-' : '') + absNum.toFixed(4)
  if (absNum < 1) return (isNegative ? '-' : '') + absNum.toFixed(3)
  return (isNegative ? '-' : '') + absNum.toFixed(2)
}

export function formatPercentage(num: number): string {
  if (num === undefined || num === null) return '0%'

  const absNum = Math.abs(num)
  if (absNum < 0.01) {
    return num > 0 ? '<0.01%' : '>-0.01%'
  }

  return num.toFixed(2) + '%'
}

export function formatUSD(num: number): string {
  return `$${formatNumber(num)}`
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatLargeNumber(num: number, tokenDecimals: number | undefined) {
  if (num !== 0 && Math.abs(num) < 0.0001) {
    return num.toExponential(4)
  }
  const decimals = tokenDecimals ?? 6
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
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