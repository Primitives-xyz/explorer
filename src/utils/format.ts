export function formatNumber(num: number, precision?: number): string {
  if (num === undefined || num === null) return '0'

  // Handle very small numbers
  if (num < 0.00001) {
    return '<0.00001'
  }

  // Handle large numbers
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B'
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K'
  }

  // Handle precision
  if (precision !== undefined) {
    return num.toFixed(precision)
  }

  // Dynamic precision based on number size
  if (num < 0.01) return num.toFixed(4)
  if (num < 1) return num.toFixed(3)
  return num.toFixed(2)
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
