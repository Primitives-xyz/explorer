import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js'
import { NextResponse } from 'next/server'
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import bs58 from 'bs58'
import { addPriorityFee } from '@/utils/priority-fee'

const RPC_ENDPOINT =
  process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'

const FEE_WALLET = process.env.FEE_WALLET

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mintAddress = searchParams.get('mintAddress')

    if (!mintAddress) {
      return NextResponse.json(
        {
          error: 'Missing required parameters: mintAddress is required',
        },
        { status: 400 },
      )
    }

    const connection = new Connection(RPC_ENDPOINT)
    const mint = new PublicKey(mintAddress)
    const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY

    if (!PRIVATE_KEY) {
      throw new Error('PAYER_PRIVATE_KEY is not set')
    }
    if (!FEE_WALLET) {
      throw new Error('FEE_WALLET is not set')
    }

    const secretKey = bs58.decode(PRIVATE_KEY)
    const payer = Keypair.fromSecretKey(secretKey)
    console.log('Payer created...')
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mint,
      new PublicKey(FEE_WALLET),
      false, // Don't allow owner off curve
    )

    // Check if the account already exists
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress)
    if (accountInfo) {
      return NextResponse.json(
        {
          tokenAccount: associatedTokenAddress.toString(),
          status: 'exists',
        },
        {
          headers: {
            'Cache-Control':
              'public, s-maxage=3600, stale-while-revalidate=600', // Cache for 1 hour
          },
        },
      )
    }
    console.log('Creating token account instruction...')

    // Create the instruction to create the associated token account
    const instruction = createAssociatedTokenAccountInstruction(
      payer.publicKey, // payer
      associatedTokenAddress, // associated token account address
      new PublicKey(FEE_WALLET), // owner
      mint, // token mint
    )

    console.log('Getting recent blockhash...')

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash()

    console.log('Creating transaction...')

    // Create transaction
    const transaction = new Transaction({
      feePayer: payer.publicKey,
      blockhash,
      lastValidBlockHeight,
    }).add(instruction)

    // Add priority fee to the transaction
    await addPriorityFee(transaction, 'Medium')

    // Sign and send the transaction
    transaction.sign(payer)
    console.log('Sending transaction...')
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      { maxRetries: 5 },
    )
    console.log('Transaction sent...')
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed',
    )
    console.log('Transaction confirmed...')
    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${confirmation.value.err.toString()}`,
      )
    }
    console.log('Transaction successful...')
    // Return the signature and token account
    return NextResponse.json({
      signature,
      tokenAccount: associatedTokenAddress.toString(),
      status: 'created',
    })
  } catch (error) {
    console.error('Error getting token account:', error)
    return NextResponse.json(
      { error: `Failed to get token account: ${error}` },
      { status: 500 },
    )
  }
}
