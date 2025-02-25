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

/**
 * Formats a blockchain address with customizable prefix and suffix lengths
 * @param address The address to format
 * @param prefixLength Number of characters to show at the beginning
 * @param suffixLength Number of characters to show at the end
 * @returns Formatted address string
 */
export function formatAddress(
  address: string,
  prefixLength = 4,
  suffixLength = 4
): string {
  if (!address) return ''
  if (address.length <= prefixLength + suffixLength) return address

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
}
