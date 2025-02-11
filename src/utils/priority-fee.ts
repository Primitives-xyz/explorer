import { ComputeBudgetProgram, Transaction } from '@solana/web3.js'

export type PriorityLevel =
  | 'Min'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax'

const HELIUS_API_KEY = process.env.HELIUS_API_KEY
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

export async function getPriorityFeeEstimate(
  transaction: Transaction,
  priorityLevel: PriorityLevel = 'Medium',
  options = {}
) {
  if (!HELIUS_API_KEY) {
    throw new Error('HELIUS_API_KEY is not configured')
  }

  // Serialize the transaction and encode it properly for the API
  const serializedTransaction = Buffer.from(
    transaction.serialize({ verifySignatures: false })
  ).toString('base64')

  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'helius-priority-fee',
      method: 'getPriorityFeeEstimate',
      params: [
        {
          transaction: serializedTransaction,
          options: {
            ...options,
            priorityLevel,
            includeAllPriorityFeeLevels: true,
          },
        },
      ],
    }),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  // Ensure we have a valid priority fee value
  const priorityFee = data.result?.priorityFeeLevels?.[priorityLevel]
  if (typeof priorityFee !== 'number' || isNaN(priorityFee)) {
    // Default to a reasonable priority fee if the API doesn't return a valid value
    return BigInt(45000)
  }

  return BigInt(Math.ceil(priorityFee))
}

export async function addPriorityFee(
  transaction: Transaction,
  priorityLevel: PriorityLevel = 'Medium'
) {
  try {
    const microLamports = await getPriorityFeeEstimate(
      transaction,
      priorityLevel
    )

    // Add a ComputeBudgetProgram instruction to set the compute unit price
    const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports,
    })

    // Add the priority fee instruction at the beginning of the transaction
    transaction.instructions.unshift(priorityFeeInstruction)
  } catch (error) {
    console.error('Failed to add priority fee, using default:', error)
    // Fallback to default fee of 45000 microLamports (based on recent successful transactions)
    const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 45000,
    })
    transaction.instructions.unshift(priorityFeeInstruction)
  }
}
