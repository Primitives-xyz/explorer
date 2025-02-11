import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableAccount,
  TransactionInstruction,
  MessageV0,
} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, createTransferInstruction } from '@solana/spl-token'
import type {
  SwapInstructionsRequest,
  SwapInstructionsResponse,
} from '@/types/jupiter-service'

// Helper function to deserialize instructions from Jupiter
export const deserializeInstruction = (
  instruction: any,
): TransactionInstruction => {
  return new TransactionInstruction({
    programId: new PublicKey(instruction.programId),
    keys: instruction.accounts.map((key: any) => ({
      pubkey: new PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instruction.data, 'base64'),
  })
}

// Helper function to get address lookup table accounts
export const getAddressLookupTableAccounts = async (
  connection: Connection,
  keys: string[],
): Promise<AddressLookupTableAccount[]> => {
  if (!keys.length) return []

  try {
    const addressLookupTableAccountInfos =
      await connection.getMultipleAccountsInfo(
        keys.map((key) => new PublicKey(key)),
      )

    if (!addressLookupTableAccountInfos.length) {
      throw new Error('Failed to fetch lookup table accounts')
    }

    return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
      const addressLookupTableAddress = keys[index]
      if (accountInfo && addressLookupTableAddress) {
        try {
          const addressLookupTableAccount = new AddressLookupTableAccount({
            key: new PublicKey(addressLookupTableAddress),
            state: AddressLookupTableAccount.deserialize(accountInfo.data),
          })
          acc.push(addressLookupTableAccount)
        } catch (error: any) {
          console.error(
            `Failed to deserialize lookup table account ${addressLookupTableAddress}:`,
            error,
          )
        }
      }
      return acc
    }, new Array<AddressLookupTableAccount>())
  } catch (error: any) {
    console.error('Failed to fetch lookup table accounts:', error)
    throw new Error('Failed to fetch lookup table accounts: ' + error.message)
  }
}

// Helper function to simulate transaction
export const simulateTransaction = async (
  connection: Connection,
  transaction: VersionedTransaction,
  addressLookupTableAccounts: AddressLookupTableAccount[],
): Promise<void> => {
  try {
    const response = await connection.simulateTransaction(transaction, {
      replaceRecentBlockhash: true,
      sigVerify: false,
      accounts: {
        encoding: 'base64',
        addresses: addressLookupTableAccounts.map((account) =>
          account.key.toBase58(),
        ),
      },
    })

    if (response.value.err) {
      console.error('Simulation error:', response.value.logs)
      throw new Error(
        `Transaction simulation failed: ${JSON.stringify(response.value.err)}`,
      )
    }
  } catch (error: any) {
    console.error('Failed to simulate transaction:', error)
    throw new Error('Transaction simulation failed: ' + error.message)
  }
}

// Function to fetch swap instructions from Jupiter API
export const fetchSwapInstructions = async (
  request: SwapInstructionsRequest,
): Promise<SwapInstructionsResponse> => {
  const response = await fetch(
    'https://quote-api.jup.ag/v6/swap-instructions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: request.quoteResponse,
        userPublicKey: request.userPublicKey,
        prioritizationFeeLamports: request.prioritizationFeeLamports,
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        useSharedAccounts: false,
        feeAccount: request.feeAccount,
      }),
    },
  ).then((res) => res.json())

  if (response.error) {
    throw new Error('Failed to get swap instructions: ' + response.error)
  }

  return response
}

// Function to create SSE transfer instruction
export const createSSETransferInstruction = async (
  connection: Connection,
  sourceTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  owner: PublicKey,
  amount: string,
): Promise<TransactionInstruction> => {
  // Check if both accounts exist
  const [sourceInfo, destInfo] = await Promise.all([
    connection.getAccountInfo(sourceTokenAccount),
    connection.getAccountInfo(destinationTokenAccount),
  ])

  if (!sourceInfo || !destInfo) {
    throw new Error(
      'SSE token accounts not found. Please ensure both source and destination accounts exist.',
    )
  }

  return createTransferInstruction(
    sourceTokenAccount,
    destinationTokenAccount,
    owner,
    BigInt(amount),
    [],
    TOKEN_PROGRAM_ID,
  )
}

// Function to build and compile transaction message
export const buildTransactionMessage = (
  payerKey: PublicKey,
  recentBlockhash: string,
  swapResponse: SwapInstructionsResponse,
  sseTransferInstruction?: TransactionInstruction,
  addressLookupTableAccounts: AddressLookupTableAccount[] = [],
): MessageV0 => {
  return new TransactionMessage({
    payerKey,
    recentBlockhash,
    instructions: [
      ...(swapResponse.computeBudgetInstructions || []).map(
        deserializeInstruction,
      ),
      ...(swapResponse.setupInstructions || []).map(deserializeInstruction),
      ...(swapResponse.tokenLedgerInstruction
        ? [deserializeInstruction(swapResponse.tokenLedgerInstruction)]
        : []),
      deserializeInstruction(swapResponse.swapInstruction),
      ...(swapResponse.cleanupInstruction
        ? [deserializeInstruction(swapResponse.cleanupInstruction)]
        : []),
      ...(sseTransferInstruction ? [sseTransferInstruction] : []),
    ],
  }).compileToV0Message(addressLookupTableAccounts)
}
