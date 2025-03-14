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
  number: number,
  { withComma = false }: { withComma?: boolean } = {}
) => {
  if (withComma) {
    return number?.toLocaleString('en-US')
  } else {
    if (number >= 1000 && number <= 999999) {
      return `${Math.round((number / 1000) * 10) / 10}K`
    } else if (number >= 1000000) {
      return `${Math.floor((number / 1000000) * 10) / 10}M`
    } else {
      return number
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
