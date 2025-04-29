import { getPayerKeypair } from '@/lib/vertigo'
import { SellTokensParams } from '@/types/vertigo'
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
  createCloseAccountInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import ammIdl from '@vertigo-amm/vertigo-sdk/dist/target/idl/amm.json'
import { Amm } from '@vertigo-amm/vertigo-sdk/dist/target/types/amm'
/**
 * Creates instruction to unwrap wSOL to SOL
 * @param userPublicKey The user's public key
 * @returns Instruction to close the wSOL account
 */
async function createUnwrapSolInstruction(userPublicKey: PublicKey) {
  try {
    // Get the associated token account for wSOL
    const userWsolAta = await getAssociatedTokenAddress(
      NATIVE_MINT,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID
    )

    // Create instruction to close the wSOL account
    return createCloseAccountInstruction(
      userWsolAta, // Token account to close
      userPublicKey, // Destination account (receives SOL)
      userPublicKey, // Owner of token account
      [], // Additional signers (none needed)
      TOKEN_PROGRAM_ID // Token program ID
    )
  } catch (error: any) {
    console.error('Error creating unwrap SOL instruction:', error)
    throw new Error(`Failed to create unwrap SOL instruction: ${error.message}`)
  }
}

/**
 * Sell tokens to a Vertigo pool
 * Handles ATA creation using backend payer.
 */
export async function sellTokens(
  connection: Connection,
  params: Omit<SellTokensParams, 'userTaA' | 'userTaB'> & {
    userAddress: string
  }
): Promise<string> {
  try {
    const RPC_URL = process.env.RPC_URL ?? 'https://api.devnet.solana.com'
    const umi = createUmi(RPC_URL, 'confirmed')

    const dummyPayer = anchor.web3.Keypair.generate()
    const dummyWallet = new anchor.Wallet(dummyPayer)

    // Convert string addresses to PublicKeys
    const owner = new PublicKey(params.poolOwner)
    const mintA = new PublicKey(params.mintA)
    const mintB = new PublicKey(params.mintB)
    const userPublicKey = new PublicKey(params.userAddress)

    // --- Get backend payer and create/find ATAs ---
    const backendPayer = getPayerKeypair()
    console.log(
      `[sellTokens] Using backend payer: ${backendPayer.publicKey.toString()}`
    )

    console.log(
      `[sellTokens] Getting/creating ATA for Mint A (${mintA.toString()}) owned by ${userPublicKey.toString()}`
    )
    const userTaAResponse = await getOrCreateAssociatedTokenAccount(
      connection,
      backendPayer,
      mintA,
      userPublicKey,
      false,
      'confirmed',
      { commitment: 'confirmed' },
      mintA.equals(NATIVE_MINT) ? TOKEN_PROGRAM_ID : TOKEN_PROGRAM_ID
    )
    const userTaA = userTaAResponse.address
    console.log(
      `[sellTokens] Using ATA A (${userTaA.toString()}) for owner ${userPublicKey.toString()}`
    )

    console.log(
      `[sellTokens] Getting/creating ATA for Mint B (${mintB.toString()}) owned by ${userPublicKey.toString()}`
    )
    const userTaBResponse = await getOrCreateAssociatedTokenAccount(
      connection,
      backendPayer,
      mintB,
      userPublicKey,
      false,
      'confirmed',
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    )
    const userTaB = userTaBResponse.address
    console.log(
      `[sellTokens] Using ATA B (${userTaB.toString()}) for owner ${userPublicKey.toString()}`
    )
    // --- End ATA logic ---

    // Check if the user has enough token balance
    try {
      const balance = await connection.getTokenAccountBalance(userTaB)
      const tokenBalance = new BN(balance.value.amount).toNumber()
      console.log(`[sellTokens] User token B balance: ${tokenBalance}`)

      // Calculate the amount in token's smallest unit based on token decimals
      // For TOKEN_2022, we need to get the decimals from the mint
      const mintInfo = await connection.getParsedAccountInfo(mintB)
      // @ts-ignore
      const tokenDecimals = mintInfo.value?.data?.parsed?.info?.decimals || 9
      const amountInSmallestUnit = Math.floor(
        params.amount * 10 ** tokenDecimals
      )

      if (tokenBalance < amountInSmallestUnit) {
        throw new Error(
          `Insufficient token balance. Has: ${
            tokenBalance / 10 ** tokenDecimals
          }, needs: ${params.amount}`
        )
      }

      // Convert to BN for Anchor
      const amountBN = new BN(amountInSmallestUnit)

      console.log(
        `Fetching quote for selling ${
          params.amount
        } tokens (${amountBN.toString()} smallest units)`
      )
      console.log({
        mintA: mintA.toString(),
        mintB: mintB.toString(),
        user: userPublicKey.toString(),
        owner: owner.toString(),
        amount: amountBN.toString(),
      })

      const provider = new anchor.AnchorProvider(
        connection,
        dummyWallet,
        anchor.AnchorProvider.defaultOptions()
      )
      const program = new anchor.Program<Amm>(ammIdl as Amm, provider)

      const sellParams = { amount: amountBN, limit: new BN(0) }
      console.log('Creating sell instruction with params:', sellParams)
      console.log('Accounts for sell:', {
        owner: owner.toString(),
        user: userPublicKey.toString(),
        mintA: mintA.toString(),
        mintB: mintB.toString(),
        userTaA: userTaA.toString(),
        userTaB: userTaB.toString(),
        tokenProgramA: mintA.equals(NATIVE_MINT)
          ? TOKEN_PROGRAM_ID.toString()
          : TOKEN_PROGRAM_ID.toString(),
        tokenProgramB: TOKEN_2022_PROGRAM_ID.toString(),
      })

      const sellIx = await program.methods
        .sell(sellParams)
        .accounts({
          owner,
          user: userPublicKey,
          mintA,
          mintB,
          userTaA,
          userTaB,
          tokenProgramA: mintA.equals(NATIVE_MINT)
            ? TOKEN_PROGRAM_ID
            : TOKEN_PROGRAM_ID,
          tokenProgramB: TOKEN_2022_PROGRAM_ID,
        })
        .instruction()

      let tx = transactionBuilder()
      const signer = createNoopSigner(fromWeb3JsPublicKey(userPublicKey))

      tx = tx.add({
        instruction: fromWeb3JsInstruction(sellIx),
        signers: [signer],
        bytesCreatedOnChain: 0,
      })

      // --- Handle unwrapping wSOL after sell if mintA is native SOL ---
      if (mintA.equals(NATIVE_MINT)) {
        console.log(
          '[sellTokens] Detected wSOL as output, adding unwrap instruction'
        )

        try {
          // Check if there's a wSOL balance after the trade would complete
          const wSolBalance = await connection.getTokenAccountBalance(userTaA)
          console.log(
            `[sellTokens] User wSOL balance: ${wSolBalance.value.amount}`
          )

          const unwrapIx = await createUnwrapSolInstruction(userPublicKey)
          tx = tx.add({
            instruction: fromWeb3JsInstruction(unwrapIx),
            signers: [signer],
            bytesCreatedOnChain: 0,
          })
          console.log('[sellTokens] Added unwrap SOL instruction')
        } catch (error) {
          console.log(
            '[sellTokens] Error checking wSOL balance, skipping unwrap'
          )
        }
      }
      // --- End unwrap wSOL handling ---

      umi.use(signerIdentity(signer))
      const sellTx = await tx
        .useV0()
        .setBlockhash(await umi.rpc.getLatestBlockhash())
        .buildAndSign(umi)

      console.log('Serializing transaction...')
      const serializedSellTx = umi.transactions.serialize(sellTx)
      const serializedSellTxAsString = base64.deserialize(serializedSellTx)[0]

      console.log('Returning serialized transaction.')
      return serializedSellTxAsString
    } catch (error: any) {
      console.error('Error getting token balance:', error)
      throw new Error(
        `Failed to get token balance or token account doesn't exist: ${error.message}`
      )
    }
  } catch (error: any) {
    console.error('Error selling tokens to Vertigo pool:', error)
    if (error.logs) {
      console.error('Transaction Logs:', error.logs)
    }
    if (error instanceof Error) {
      console.error('Error Name:', error.name)
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)
    }
    throw new Error(`Failed to prepare sell transaction: ${error.message}`)
  }
}
