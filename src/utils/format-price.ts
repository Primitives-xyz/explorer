/**
 * Format a price with subscript notation for many leading zeros
 * e.g. 0.00000821 becomes 0.0₅821
 */
export function formatPriceWithSubscript(price: number): string {
  if (price === 0) return '0'
  if (price >= 0.01) {
    // For prices >= 0.01, use regular formatting
    return price.toLocaleString(undefined, { maximumFractionDigits: 8 })
  }

  // Convert to string in scientific notation to handle very small numbers
  const str = price.toExponential()
  const [mantissa, exponent] = str.split('e')
  const exp = Math.abs(parseInt(exponent))

  if (exp <= 2) {
    // If only 1-2 zeros, show normally
    return price.toFixed(exp + 3)
  }

  // Get the significant digits after removing leading zeros
  const priceStr = price.toFixed(exp + 4) // Get enough precision
  const match = priceStr.match(/0\.0+(\d+)/)

  if (!match) {
    return price.toString()
  }

  const zeros = match[0].match(/0/g)?.length || 0
  const leadingZeros = zeros - 2 // Subtract the "0." part
  const significantDigits = match[1]

  // Convert number to subscript
  const subscriptMap: { [key: string]: string } = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  }

  const subscriptNumber = leadingZeros
    .toString()
    .split('')
    .map((digit) => subscriptMap[digit] || digit)
    .join('')

  return `0.0${subscriptNumber}${significantDigits}`
}

/**
 * Format a price with currency (SOL or USD) and subscript notation
 */
export function formatPriceWithCurrency(
  priceInSol: number,
  currency: 'SOL' | 'USD',
  solPrice: number | null
): string {
  if (currency === 'USD' && solPrice) {
    const priceInUsd = priceInSol * solPrice
    if (priceInUsd < 0.01) {
      return `$${formatPriceWithSubscript(priceInUsd)}`
    }
    return `$${priceInUsd.toLocaleString(undefined, {
      maximumFractionDigits: priceInUsd < 1 ? 6 : 2,
    })}`
  }

  if (priceInSol < 0.01) {
    return `${formatPriceWithSubscript(priceInSol)} SOL`
  }
  return `${priceInSol.toLocaleString(undefined, {
    maximumFractionDigits: 8,
  })} SOL`
}
