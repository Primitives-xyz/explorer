import { NextResponse } from 'next/server'
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableAccount,
  TransactionInstruction,
  Keypair,
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { createATAIfNotExists } from '@/utils/token'
import bs58 from 'bs58'

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
const SSE_TOKEN_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'

interface SwapRequest {
  quoteResponse: any
  walletAddress: string
  sseTokenAccount?: string
  sseFeeAmount?: string
  priorityFee?: number
  mintAddress: string
}

const FEE_WALLET = '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'

// Helper function to deserialize instructions from Jupiter
const deserializeInstruction = (instruction: any): TransactionInstruction => {
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
const getAddressLookupTableAccounts = async (
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
const simulateTransaction = async (
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

export async function POST(request: Request) {
  try {
    const {
      quoteResponse,
      walletAddress,
      sseTokenAccount,
      sseFeeAmount,
      priorityFee,
      mintAddress,
    } = (await request.json()) as SwapRequest

    // Get and verify the ATA for the output token
    const associatedTokenAddress = await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      new PublicKey(FEE_WALLET),
      false, // Don't allow owner off curve
    )

    // Verify output token ATA exists, if not create it
    const outputAtaInfo = await connection.getAccountInfo(
      associatedTokenAddress,
    )
    if (!outputAtaInfo) {
      // Get the payer's keypair for creating ATAs
      const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY
      if (!PRIVATE_KEY) {
        throw new Error('PAYER_PRIVATE_KEY is not set')
      }
      const secretKey = bs58.decode(PRIVATE_KEY)
      const payer = Keypair.fromSecretKey(secretKey)

      // Create the ATA with High priority to ensure it goes through quickly
      await createATAIfNotExists(
        connection,
        payer,
        new PublicKey(mintAddress),
        new PublicKey(FEE_WALLET),
        'High', // Use high priority for platform fee ATA
      )
    }

    // If using SSE fees, verify SSE fee ATA exists
    if (sseTokenAccount) {
      const sseAtaInfo = await connection.getAccountInfo(
        new PublicKey(sseTokenAccount),
      )
      if (!sseAtaInfo) {
        // Get the payer's keypair for creating ATAs if not already done
        const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY
        if (!PRIVATE_KEY) {
          throw new Error('PAYER_PRIVATE_KEY is not set')
        }
        const secretKey = bs58.decode(PRIVATE_KEY)
        const payer = Keypair.fromSecretKey(secretKey)

        // Create the SSE ATA with High priority
        await createATAIfNotExists(
          connection,
          payer,
          new PublicKey(SSE_TOKEN_MINT),
          new PublicKey(walletAddress),
          'High', // Use high priority for SSE token ATA
        )
      }
    }

    // Get swap instructions from Jupiter with platform fees properly configured
    const swapResponse = await fetch(
      'https://quote-api.jup.ag/v6/swap-instructions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: walletAddress,
          prioritizationFeeLamports: priorityFee,
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
          useSharedAccounts: false,
          // Always include fee account since we're always using a platform fee
          feeAccount: associatedTokenAddress.toString(),
        }),
      },
    ).then((res) => res.json())

    if (swapResponse.error) {
      throw new Error('Failed to get swap instructions: ' + swapResponse.error)
    }

    // Get lookup table accounts
    const addressLookupTableAccounts = await getAddressLookupTableAccounts(
      swapResponse.addressLookupTableAddresses || [],
    )

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()

    // Create SSE transfer instruction if sseTokenAccount and sseFeeAmount are provided
    let sseTransferInstruction: TransactionInstruction | null = null
    if (sseTokenAccount && sseFeeAmount) {
      const sourceTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(SSE_TOKEN_MINT),
        new PublicKey(walletAddress),
      )

      console.log('SSE Transfer Details:')
      console.log('Source Token Account:', sourceTokenAccount.toString())
      console.log('Destination SSE Account:', sseTokenAccount)
      console.log('SSE Fee Amount:', sseFeeAmount)
      console.log('Wallet Address:', walletAddress)

      // Check if both accounts exist
      const [sourceInfo, destInfo] = await Promise.all([
        connection.getAccountInfo(sourceTokenAccount),
        connection.getAccountInfo(new PublicKey(sseTokenAccount)),
      ])

      console.log(
        'Source Account Info:',
        sourceInfo ? 'exists' : 'not found',
        sourceInfo?.data.length || 0,
        'bytes',
      )
      console.log(
        'Destination Account Info:',
        destInfo ? 'exists' : 'not found',
        destInfo?.data.length || 0,
        'bytes',
      )

      if (!sourceInfo || !destInfo) {
        throw new Error(
          'SSE token accounts not found. Please ensure both source and destination accounts exist.',
        )
      }

      sseTransferInstruction = createTransferInstruction(
        sourceTokenAccount, // source
        new PublicKey(sseTokenAccount), // destination
        new PublicKey(walletAddress), // owner
        BigInt(sseFeeAmount), // amount
        [], // multisigners
        TOKEN_PROGRAM_ID,
      )

      console.log('SSE Transfer Instruction created:', {
        source: sourceTokenAccount.toString(),
        destination: sseTokenAccount,
        owner: walletAddress,
        amount: sseFeeAmount,
      })
    }

    // Create transaction with Jupiter's instructions and SSE transfer
    const message = new TransactionMessage({
      payerKey: new PublicKey(walletAddress),
      recentBlockhash: blockhash,
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
        ...(sseTransferInstruction ? [sseTransferInstruction] : []), // Add SSE transfer if exists
      ],
    }).compileToV0Message(addressLookupTableAccounts)

    const transaction = new VersionedTransaction(message)

    // Simulate the transaction before returning
    await simulateTransaction(transaction, addressLookupTableAccounts)

    return NextResponse.json({
      transaction: Buffer.from(transaction.serialize()).toString('base64'),
      lastValidBlockHeight: swapResponse.lastValidBlockHeight,
      computeUnitLimit: swapResponse.computeUnitLimit,
      prioritizationFeeLamports: swapResponse.prioritizationFeeLamports,
    })
  } catch (error: any) {
    console.error('Error building swap transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to build swap transaction' },
      { status: 500 },
    )
  }
}
