import { BuyTokensParams } from '@/types/vertigo'
import { getPayerKeypair } from '@/utils/utils'
import * as anchor from '@coral-xyz/anchor'
import { BN } from '@coral-xyz/anchor'
import {
  createNoopSigner,
  signerIdentity,
  transactionBuilder,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
  fromWeb3JsInstruction,
  fromWeb3JsPublicKey,
} from '@metaplex-foundation/umi-web3js-adapters'
import { base64 } from '@metaplex-foundation/umi/serializers'
import {
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createSyncNativeInstruction,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import ammIdl from '@vertigo-amm/vertigo-sdk/dist/target/idl/amm.json'
import { Amm } from '@vertigo-amm/vertigo-sdk/dist/target/types/amm'

/**
 * Wraps SOL to wSOL
 * @param connection - Solana connection
 * @param amountLamports - Amount to wrap in lamports
 * @param userPublicKey - User's public key
 * @param payer - Payer keypair for the transaction
 * @returns Array of transaction instructions
 */
async function wrapSol(
  connection: Connection,
  amountLamports: number,
  userPublicKey: PublicKey,
  payer: Keypair
): Promise<TransactionInstruction[]> {
  try {
    const userWsolAta = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      NATIVE_MINT,
      userPublicKey,
      false,
      'confirmed',
      { commitment: 'confirmed' },
      TOKEN_PROGRAM_ID
    )

    return [
      SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: userWsolAta.address,
        lamports: amountLamports,
      }),
      createSyncNativeInstruction(userWsolAta.address),
    ]
  } catch (error: any) {
    console.error('Error wrapping SOL:', error)
    throw new Error(
      `Failed to prepare SOL wrapping transaction: ${error.message}`
    )
  }
}

/**
 * Get or create a token account for the user
 */
async function getOrCreateUserTokenAccount(
  connection: Connection,
  mint: PublicKey,
  userPublicKey: PublicKey,
  backendPayer: Keypair,
  tokenProgramId: PublicKey
): Promise<PublicKey> {
  const response = await getOrCreateAssociatedTokenAccount(
    connection,
    backendPayer,
    mint,
    userPublicKey,
    false,
    'confirmed',
    { commitment: 'confirmed' },
    tokenProgramId
  )

  return response.address
}

/**
 * Check if user has sufficient SOL and handle wrapping if needed
 */
async function handleSolTokenInput(
  connection: Connection,
  userPublicKey: PublicKey,
  userTaA: PublicKey,
  amount: number,
  backendPayer: Keypair
): Promise<TransactionInstruction[] | undefined> {
  console.log('[buyTokens] Detected SOL as input token, checking wSOL balance')

  const amountInLamports = amount * LAMPORTS_PER_SOL

  // Check wSOL balance
  let wSolBalance = 0
  try {
    const balance = await connection.getTokenAccountBalance(userTaA)
    wSolBalance = new BN(balance.value.amount).toNumber()
    console.log(
      `[buyTokens] User wSOL balance: ${wSolBalance / LAMPORTS_PER_SOL} SOL`
    )
  } catch (error) {
    console.log(
      "[buyTokens] Error getting wSOL balance, likely account doesn't exist yet"
    )
  }

  // Check native SOL balance
  const solBalance = await connection.getBalance(userPublicKey)
  console.log(
    `[buyTokens] User SOL balance: ${solBalance / LAMPORTS_PER_SOL} SOL`
  )

  // Check if we need to wrap SOL
  if (amountInLamports > wSolBalance) {
    console.log(
      `[buyTokens] Need more wSOL: has ${wSolBalance}, needs ${amountInLamports}`
    )

    // Check if user has enough total SOL (wSOL + SOL)
    if (solBalance + wSolBalance < amountInLamports) {
      throw new Error(
        `Not enough SOL. Balance: ${
          (solBalance + wSolBalance) / LAMPORTS_PER_SOL
        } SOL, required: ${amount} SOL`
      )
    }

    // Calculate how much SOL to wrap
    const diffLamports = amountInLamports - wSolBalance
    if (diffLamports > 0) {
      console.log(
        `[buyTokens] Preparing transaction to wrap ${
          diffLamports / LAMPORTS_PER_SOL
        } SOL to wSOL`
      )
      return await wrapSol(
        connection,
        diffLamports,
        userPublicKey,
        backendPayer
      )
    }
  }

  // Validate wSOL account has or will have sufficient balance
  if (wSolBalance < amountInLamports) {
    throw new Error(
      `Insufficient wSOL balance for operation. Has: ${
        wSolBalance / LAMPORTS_PER_SOL
      } SOL, needs: ${amount} SOL`
    )
  }

  return undefined
}

/**
 * Check if user has sufficient tokens for non-SOL token
 */
async function checkNonSolTokenBalance(
  connection: Connection,
  userTaA: PublicKey,
  amountLamports: BN
): Promise<void> {
  try {
    const balance = await connection.getTokenAccountBalance(userTaA)
    const tokenBalance = new BN(balance.value.amount).toNumber()
    console.log(`[buyTokens] User token A balance: ${tokenBalance}`)

    if (tokenBalance < amountLamports.toNumber()) {
      throw new Error(
        `Insufficient token balance. Has: ${tokenBalance}, needs: ${amountLamports.toNumber()}`
      )
    }
  } catch (error: any) {
    throw new Error(
      `Failed to get token balance or token account doesn't exist: ${error.message}`
    )
  }
}

/**
 * Buy tokens from a Vertigo pool
 * @param connection - Solana connection
 * @param params - Parameters for buying tokens
 * @returns Serialized transaction as string
 */
export async function createBuyTransactionIX(
  connection: Connection,
  params: Omit<BuyTokensParams, 'userTaA' | 'userTaB'> & { userAddress: string }
): Promise<string> {
  try {
    const RPC_URL = process.env.RPC_URL ?? 'https://api.devnet.solana.com'
    const umi = createUmi(RPC_URL, 'confirmed')

    // Setup dummy wallet for Anchor program
    const dummyPayer = Keypair.generate()
    const dummyWallet = new anchor.Wallet(dummyPayer)

    // Convert string addresses to PublicKeys
    const owner = new PublicKey(params.poolOwner)
    const mintA = new PublicKey(params.mintA)
    const mintB = new PublicKey(params.mintB)
    const userPublicKey = new PublicKey(params.userAddress)
    const amountLamports = new BN(params.amount * LAMPORTS_PER_SOL)

    // Get backend payer for ATA creation
    const backendPayer = getPayerKeypair()
    console.log(
      `[buyTokens] Using backend payer: ${backendPayer.publicKey.toString()}`
    )

    // Get token program IDs
    const tokenProgramA = mintA.equals(NATIVE_MINT)
      ? TOKEN_PROGRAM_ID
      : TOKEN_PROGRAM_ID
    const tokenProgramB = TOKEN_2022_PROGRAM_ID

    // Get or create token accounts
    console.log(
      `[buyTokens] Getting/creating ATA for Mint A (${mintA.toString()}) owned by ${userPublicKey.toString()}`
    )
    const userTaA = await getOrCreateUserTokenAccount(
      connection,
      mintA,
      userPublicKey,
      backendPayer,
      tokenProgramA
    )
    console.log(
      `[buyTokens] Using ATA A (${userTaA.toString()}) for owner ${userPublicKey.toString()}`
    )

    console.log(
      `[buyTokens] Getting/creating ATA for Mint B (${mintB.toString()}) owned by ${userPublicKey.toString()}`
    )
    const userTaB = await getOrCreateUserTokenAccount(
      connection,
      mintB,
      userPublicKey,
      backendPayer,
      tokenProgramB
    )
    console.log(
      `[buyTokens] Using ATA B (${userTaB.toString()}) for owner ${userPublicKey.toString()}`
    )

    // Handle SOL wrapping if needed
    let wrapTx: TransactionInstruction[] | undefined
    if (mintA.equals(NATIVE_MINT)) {
      wrapTx = await handleSolTokenInput(
        connection,
        userPublicKey,
        userTaA,
        params.amount,
        backendPayer
      )
    } else {
      // For non-SOL tokens, check balance
      await checkNonSolTokenBalance(connection, userTaA, amountLamports)
    }

    // Create Anchor program instance
    const provider = new anchor.AnchorProvider(
      connection,
      dummyWallet,
      anchor.AnchorProvider.defaultOptions()
    )
    const program = new anchor.Program<Amm>(ammIdl as Amm, provider)

    // Create buy instruction
    const buyParams = { amount: amountLamports, limit: new BN(0) }
    const buyIx = await program.methods
      .buy(buyParams)
      .accounts({
        owner,
        user: userPublicKey,
        mintA,
        mintB,
        userTaA,
        userTaB,
        tokenProgramA,
        tokenProgramB,
      })
      .instruction()

    // Build transaction
    let tx = transactionBuilder()
    const signer = createNoopSigner(fromWeb3JsPublicKey(userPublicKey))

    // Add wrap instructions if needed
    if (wrapTx) {
      wrapTx.forEach((instruction) => {
        tx = tx.add({
          instruction: fromWeb3JsInstruction(instruction),
          signers: [signer],
          bytesCreatedOnChain: 0,
        })
      })
    }

    // Add buy instruction
    tx = tx.add({
      instruction: fromWeb3JsInstruction(buyIx),
      signers: [signer],
      bytesCreatedOnChain: 0,
    })

    // Sign and serialize transaction
    umi.use(signerIdentity(signer))
    const buyTx = await tx
      .useV0()
      .setBlockhash(await umi.rpc.getLatestBlockhash())
      .buildAndSign(umi)

    console.log('Serializing transaction...')
    const serializedBuyTx = umi.transactions.serialize(buyTx)
    const serializedBuyTxAsString = base64.deserialize(serializedBuyTx)[0]

    console.log('Returning serialized transaction.')
    return serializedBuyTxAsString
  } catch (error: any) {
    console.error('Error buying tokens from Vertigo pool:', error)
    if (error.logs) {
      console.error('Transaction Logs:', error.logs)
    }
    if (error instanceof Error) {
      console.error('Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }
    throw new Error(`Failed to prepare buy transaction: ${error.message}`)
  }
}
