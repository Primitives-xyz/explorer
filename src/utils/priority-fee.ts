import { Transaction, ComputeBudgetProgram } from '@solana/web3.js'

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
  options = {},
) {
  if (!HELIUS_API_KEY) {
    throw new Error('HELIUS_API_KEY is not configured')
  }

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
          transaction: transaction
            .serialize({ verifySignatures: false })
            .toString('base64'),
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

  return data.result
}

export async function addPriorityFee(
  transaction: Transaction,
  priorityLevel: PriorityLevel = 'Medium',
) {
  try {
    const estimate = await getPriorityFeeEstimate(transaction, priorityLevel)
    const microLamports = estimate.priorityFeeLevels[priorityLevel]

    // Add a ComputeBudgetProgram instruction to set the compute unit price
    const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports,
    })

    // Add the priority fee instruction at the beginning of the transaction
    transaction.instructions.unshift(priorityFeeInstruction)
  } catch (error) {
    console.error('Failed to add priority fee:', error)
  }
}
