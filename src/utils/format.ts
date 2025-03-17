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

export function formatTokenBalance(balance: number, decimals: number): number {
  if (balance === undefined || balance === null) return 0
  if (decimals === undefined || decimals === null) return balance
  
  // Adjust the balance by moving the decimal point according to the token's decimals
  return balance / Math.pow(10, decimals)
}
