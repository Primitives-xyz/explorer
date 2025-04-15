import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const randomIntInRange = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const mapEmpty = <T>(amount: number, fn: (index: number) => T): T[] => {
  return Array(amount)
    .fill(null)
    .map((_, index) => fn(index))
}

export const formatNumber = (
  input: number | string,
  { withComma = false }: { withComma?: boolean } = {}
): string => {
  const number = Number(input)

  if (isNaN(number)) return '0.00'

  if (withComma) {
    return number.toLocaleString('en-US')
  } else {
    if (number >= 1_000_000) {
      return `${(number / 1_000_000).toFixed(2)}M`
    } else if (number >= 1_000) {
      return `${(number / 1_000).toFixed(2)}K`
    } else {
      return number.toFixed(2)
    }
  }
}

export function formatSmallNumber(num: number, precision?: number): string {
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

export const formatCurrency = (value: number) => {
  // we round to the lowest closest cent
  const roundedValue = parseFloat(value.toFixed(2))

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(roundedValue)
}

export const abbreviateWalletAddress = ({
  address,
  maxLength = 10,
}: {
  address: string
  maxLength?: number
}) => {
  if (address.length <= maxLength) return address

  const PRE_EMPTIVE_WALLET_ADDRESS_PREFIX = 'pre-emptive-'
  if (address.startsWith(PRE_EMPTIVE_WALLET_ADDRESS_PREFIX)) {
    return 'LOADING…'
  }

  const start = address.substring(0, 4)
  const end = address.substring(address.length - 4)

  return `${start}…${end}`
}

export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds)

    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`
    }
  }

  return 'just now'
}

export const handleCopy = ({ copyText }: { copyText: string }) => {
  navigator.clipboard.writeText(copyText)
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
