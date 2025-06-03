import { Connection, PublicKey, Transaction } from '@solana/web3.js'

/**
 * Serializes a transaction for client-side signing without requiring signatures
 * This prevents signature verification errors when sending transactions from the API
 */
export async function serializeTransactionForClient(
  transaction: Transaction,
  connection: Connection,
  payerPubkey: PublicKey
): Promise<string> {
  // Get latest blockhash
  const { blockhash } = await connection.getLatestBlockhash('finalized')

  // Set transaction properties
  transaction.recentBlockhash = blockhash
  transaction.feePayer = payerPubkey

  // Serialize without signature verification
  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  })

  // Return base64 encoded transaction
  return Buffer.from(serialized).toString('base64')
}

/**
 * Common error response for transaction APIs
 */
export function createTransactionErrorResponse(error: unknown) {
  console.error('Transaction API error:', error)
  return Response.json(
    {
      error:
        error instanceof Error ? error.message : 'Transaction creation failed',
    },
    { status: 500 }
  )
}
