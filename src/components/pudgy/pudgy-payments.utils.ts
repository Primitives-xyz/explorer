import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'

/**
 * Creates a memo instruction for a Solana transaction
 *
 * @param memo - The memo text to add to the transaction
 * @param feePayer - The public key of the fee payer
 * @returns TransactionInstruction for the memo
 */
export function createMemoInstruction({
  memo,
  feePayer,
}: {
  memo: string
  feePayer: PublicKey
}): TransactionInstruction {
  // The Memo Program ID
  const MEMO_PROGRAM_ID = new PublicKey(
    'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
  )

  return new TransactionInstruction({
    keys: [{ pubkey: feePayer, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, 'utf-8'),
  })
}

/**
 * Adds a memo to a Solana transaction
 *
 * @param transaction - The transaction to add the memo to
 * @param memo - The memo text to add
 * @param feePayer - The public key of the fee payer
 * @returns The updated transaction with the memo
 */
export function addMemoToTransaction({
  transaction,
  memo,
  feePayer,
}: {
  transaction: Transaction
  memo: string
  feePayer: PublicKey
}): Transaction {
  const memoInstruction = createMemoInstruction({ memo, feePayer })
  transaction.add(memoInstruction)
  return transaction
}

/**
 * Converts a lamports amount to SOL with proper decimal formatting
 *
 * @param lamports - The amount in lamports to convert
 * @returns A string representation of the SOL amount with 3 decimal places for normal values
 *          but preserves all significant decimal places for very small values
 * @example
 * // Returns "0.0000005"
 * getSolFromLamports(500)
 * // Returns "0.547"
 * getSolFromLamports(546700000)
 */
export const getSolFromLamports = (lamports: number): string => {
  // Calculate actual SOL value with all 9 decimal places
  const solWithDecimals = (lamports / LAMPORTS_PER_SOL).toFixed(9)
  const solValue = parseFloat(solWithDecimals)

  // If the value is zero, just return "0"
  if (solValue === 0) {
    return '0'
  }

  // Check if this is a very small value (less than 0.001)
  if (Math.abs(solValue) < 0.001) {
    // For very small values, preserve all significant decimal places
    // Remove trailing zeros only (not leading zeros)
    return solWithDecimals.replace(/(\.\d*[1-9])0+$|\.0+$/, '$1')
  }

  // For normal values, round to 3 decimal places
  return solValue.toFixed(3).replace(/\.0+$/, '')
}
