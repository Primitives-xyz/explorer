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
