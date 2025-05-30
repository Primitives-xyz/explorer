import {
  setComputeUnitLimit,
  setComputeUnitPrice,
} from '@metaplex-foundation/mpl-toolbox'
import { Transaction, TransactionBuilder, Umi } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { base64 } from '@metaplex-foundation/umi/serializers'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
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
  desiredLength = 8,
}: {
  address: string
  maxLength?: number
  desiredLength?: number
}) => {
  if (address.length <= maxLength) return address

  const PRE_EMPTIVE_WALLET_ADDRESS_PREFIX = 'pre-emptive-'
  if (address.startsWith(PRE_EMPTIVE_WALLET_ADDRESS_PREFIX)) {
    return 'LOADING…'
  }

  // Calculate how many characters to show on each end
  const charsPerSide = Math.floor((desiredLength - 1) / 2) // -1 for the ellipsis
  const start = address.substring(0, charsPerSide)
  const end = address.substring(address.length - charsPerSide)

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

/**
 * Calculates the optimal priority fee based on recent transactions
 * for accounts in the transaction
 * @param umi - The Umi instance
 * @param transaction - The transaction to calculate the fee for
 * @returns The average priority fee in microLamports
 */
export const getPriorityFee = async (
  umi: Umi,
  transaction: TransactionBuilder
): Promise<number> => {
  // Get unique writable accounts involved in the transaction
  const distinctPublicKeys = new Set<string>()

  transaction.items.forEach((item) => {
    item.instruction.keys.forEach((key) => {
      if (key.isWritable) {
        distinctPublicKeys.add(key.pubkey.toString())
      }
    })
  })

  // If no writable accounts, return a default value
  if (distinctPublicKeys.size === 0) {
    return 1000 // Default micro-lamports if no writable accounts
  }

  // Query recent prioritization fees
  const response = await fetch(umi.rpc.getEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getRecentPrioritizationFees',
      params: [Array.from(distinctPublicKeys)],
    }),
  })

  if (!response.ok) {
    console.warn(
      `Failed to fetch priority fees: ${response.status}, using default`
    )
    return 1000 // Default if request fails
  }

  const data = (await response.json()) as {
    result: { prioritizationFee: number; slot: number }[]
  }
  // Calculate average of top 100 fees
  const fees = data.result?.map((entry) => entry.prioritizationFee) || []
  if (fees.length === 0) return 1000 // Default if no fee data

  const topFees = fees.sort((a, b) => b - a).slice(0, 100)
  const averageFee = Math.ceil(
    topFees.reduce((sum, fee) => sum + fee, 0) / topFees.length
  )

  return Math.max(averageFee, 1) // Ensure at least 1 microLamport
}

/**
 * Estimates the required compute units for a transaction
 * @param umi - The Umi instance
 * @param transaction - The transaction to estimate compute units for
 * @returns Estimated compute units needed with safety buffer
 */
export const getRequiredCU = async (
  umi: Umi,
  transaction: Transaction
): Promise<number> => {
  const DEFAULT_COMPUTE_UNITS = 200_000 // Conservative default
  const BUFFER_FACTOR = 1.1 // 10% safety margin
  console.log('ABOUT TO CALL SIMULATE')
  const simulation = await umi.rpc.simulateTransaction(transaction, {
    verifySignatures: false,
  })
  console.log('Simulation:', simulation)
  try {
    // Simulate the transaction to get actual compute units needed
    const response = await fetch(umi.rpc.getEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'simulateTransaction',
        params: [
          base64.deserialize(umi.transactions.serialize(transaction))[0],
          {
            encoding: 'base64',
            replaceRecentBlockhash: true,
            sigVerify: false,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.warn(
        `Simulation failed with status ${response.status}, using default CU`
      )
      return DEFAULT_COMPUTE_UNITS
    }

    const parsedData = (await response.json()) as {
      result?: { value?: { unitsConsumed?: number } }
    }
    const unitsConsumed = parsedData.result?.value?.unitsConsumed

    if (!unitsConsumed) {
      console.warn("Simulation didn't return compute units, using default")
      return DEFAULT_COMPUTE_UNITS
    }

    // Add safety buffer
    return Math.min(
      Math.ceil(unitsConsumed * BUFFER_FACTOR),
      1_400_000 // Maximum allowed compute units
    )
  } catch (error) {
    console.warn('Error estimating compute units:', error)
    return DEFAULT_COMPUTE_UNITS
  }
}

/**
 * Optimizes a transaction with appropriate compute units and priority fees
 * @param umi - The Umi instance
 * @param transaction - Transaction builder to optimize
 * @returns Optimized transaction builder
 */
export const optimizeTransaction = async (
  umi: Umi,
  transaction: TransactionBuilder
): Promise<TransactionBuilder> => {
  try {
    // Calculate optimal priority fee
    const priorityFee = await getPriorityFee(umi, transaction)
    console.log(`Using priority fee: ${priorityFee} microLamports`)

    // First add maximum CU for simulation
    const txWithMaxCU = await transaction
      .prepend(setComputeUnitPrice(umi, { microLamports: priorityFee }))
      .prepend(setComputeUnitLimit(umi, { units: 1_400_000 }))
      .setLatestBlockhash(umi)

    const built = await txWithMaxCU.buildWithLatestBlockhash(umi)

    // Simulate to get actual CU needed
    const requiredUnits = await getRequiredCU(umi, built)
    console.log(`Using compute units: ${requiredUnits}`)

    // Build final transaction with optimized values
    return transaction
      .prepend(setComputeUnitPrice(umi, { microLamports: priorityFee }))
      .prepend(setComputeUnitLimit(umi, { units: requiredUnits }))
  } catch (error) {
    console.warn('Transaction optimization failed, using defaults:', error)
    // Apply sensible defaults if optimization fails
    return transaction
      .prepend(setComputeUnitPrice(umi, { microLamports: 1000 }))
      .prepend(setComputeUnitLimit(umi, { units: 200_000 }))
  }
}

const RPC_URL = process.env.RPC_URL ?? 'https://api.devnet.solana.com'

export function initializeUmi() {
  const umi = createUmi(RPC_URL, 'confirmed')

  return umi
}
// Helper function to get payer keypair
export function getPayerKeypair(): Keypair {
  if (!process.env.VERTIGO_SECRET_KEY) {
    throw new Error('PAYER_PRIVATE_KEY is not set')
  }
  const secretKey = bs58.decode(process.env.VERTIGO_SECRET_KEY)
  return Keypair.fromSecretKey(secretKey)
}
