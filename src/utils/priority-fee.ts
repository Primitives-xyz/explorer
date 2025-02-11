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
const DEFAULT_COMPUTE_UNIT_LIMIT = 15_000

export async function getPriorityFeeEstimate(
  transaction: Transaction,
  priorityLevel: PriorityLevel = 'Medium'
) {
  if (!HELIUS_API_KEY) {
    throw new Error('HELIUS_API_KEY is not configured')
  }

  // Extract account keys from the transaction
  const accountKeys = transaction.instructions
    .flatMap((ix) => [
      ix.programId.toString(),
      ...ix.keys.map((key) => key.pubkey.toString()),
    ])
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates

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
          accountKeys,
          options: {
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

  console.log('Priority Fee Levels:', data.result?.priorityFeeLevels)
  console.log('Selected Priority Level:', priorityLevel)

  // Ensure we have a valid priority fee value
  const priorityFee =
    data.result?.priorityFeeLevels?.[priorityLevel.toLowerCase()]
  console.log('Selected Priority Fee:', priorityFee)

  if (typeof priorityFee !== 'number' || isNaN(priorityFee)) {
    console.log('Invalid priority fee value, defaulting to 45000')
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

    // Add compute budget instructions
    const computeBudgetInstructions = [
      ComputeBudgetProgram.setComputeUnitLimit({
        units: DEFAULT_COMPUTE_UNIT_LIMIT,
      }),
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports,
      }),
    ]

    // Add the compute budget instructions at the beginning of the transaction
    transaction.instructions.unshift(...computeBudgetInstructions)
  } catch (error) {
    console.error('Failed to add priority fee, using default:', error)
    // Fallback to default compute budget settings
    const computeBudgetInstructions = [
      ComputeBudgetProgram.setComputeUnitLimit({
        units: DEFAULT_COMPUTE_UNIT_LIMIT,
      }),
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 45000,
      }),
    ]
    transaction.instructions.unshift(...computeBudgetInstructions)
  }
}
