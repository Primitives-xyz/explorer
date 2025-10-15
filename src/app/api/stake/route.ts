import { SSE_MINT, SSE_TOKEN_DECIMAL, ENABLE_STAKING } from '@/utils/constants'
import { detectStakingVersion } from '@/utils/staking-version'
import { getAssociatedTokenAccount } from '@/utils/token'
import {
  createTransactionErrorResponse,
  serializeTransactionForClient,
} from '@/utils/transaction-helpers'
import * as anchor from '@coral-xyz/anchor'
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

function convertToBN(value: number, decimals: number) {
  const wholePart = Math.floor(value)
  const precision = new anchor.BN(Math.pow(10, decimals))
  const decimalPart = Math.round((value - wholePart) * precision.toNumber())

  return new anchor.BN(wholePart).mul(precision).add(new anchor.BN(decimalPart))
}

export async function GET(req: NextRequest) {
  try {
    // Check if staking is enabled
    if (!ENABLE_STAKING) {
      return NextResponse.json(
        {
          error: 'Staking is currently disabled. Please unstake and claim your rewards.',
          disabled: true
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const amount = searchParams.get('amount')
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing wallet address or amount' },
        { status: 400 }
      )
    }

    const connection = new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    )

    const userPubkey = new PublicKey(walletAddress)

    // Detect which version to use
    const { isNewVersion, program, configPda } = await detectStakingVersion(
      connection,
      userPubkey
    )

    console.log(
      `Using ${isNewVersion ? 'new' : 'old'} staking contract for stake`
    )

    const userTokenAccount = getAssociatedTokenAccount(
      userPubkey,
      new PublicKey(SSE_MINT)
    )

    const stakeAmount = convertToBN(Number(amount), SSE_TOKEN_DECIMAL)

    // Build transaction based on version
    let stakeTx: Transaction
    if (isNewVersion) {
      // New version needs globalTokenAccount
      const globalTokenAccount = await getAssociatedTokenAccount(
        configPda,
        new PublicKey(SSE_MINT)
      )

      stakeTx = await (program.methods as any)
        .stake(stakeAmount)
        .accounts({
          user: userPubkey,
          userTokenAccount: userTokenAccount,
          globalTokenAccount: globalTokenAccount,
        })
        .transaction()
    } else {
      // Old version doesn't need globalTokenAccount
      stakeTx = await (program.methods as any)
        .stake(stakeAmount)
        .accounts({
          user: userPubkey,
          userTokenAccount: userTokenAccount,
        })
        .transaction()
    }

    // Use our helper to serialize the transaction
    const serializedTx = await serializeTransactionForClient(
      stakeTx,
      connection,
      userPubkey
    )

    return NextResponse.json({ stakeTx: serializedTx })
  } catch (err) {
    return createTransactionErrorResponse(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if staking is enabled
    if (!ENABLE_STAKING) {
      return NextResponse.json(
        {
          error: 'Staking is currently disabled. Please unstake and claim your rewards.',
          disabled: true
        },
        { status: 403 }
      )
    }

    const { signedTransaction } = await req.json()

    if (!signedTransaction) {
      return NextResponse.json(
        { error: 'Missing signed transaction' },
        { status: 400 }
      )
    }

    const connection = new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    )

    return await handleSignedTransaction(signedTransaction, connection)
  } catch (err) {
    return createTransactionErrorResponse(err)
  }
}

async function handleSignedTransaction(
  signedTransaction: string,
  connection: Connection
) {
  try {
    const serializedBuffer = Buffer.from(signedTransaction, 'base64')
    const vtx = VersionedTransaction.deserialize(
      Uint8Array.from(serializedBuffer)
    )

    // Run simulation and send transaction in parallel
    const [simulationResult, txid] = await Promise.all([
      connection.simulateTransaction(vtx, { sigVerify: false }),
      connection.sendRawTransaction(vtx.serialize()),
    ])

    // Log simulation results for debugging
    console.log('Stake simulation result:', {
      success: !simulationResult.value.err,
      logs: simulationResult.value.logs,
      error: simulationResult.value.err,
      unitsConsumed: simulationResult.value.unitsConsumed,
    })

    if (simulationResult.value.err) {
      console.error('Stake simulation failed:', simulationResult.value.err)
    }

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction({
      signature: txid,
      ...(await connection.getLatestBlockhash()),
    })

    console.log('Stake transaction confirmation:', {
      signature: txid,
      success: !confirmation.value.err,
      error: confirmation.value.err,
    })

    return NextResponse.json({
      txid,
      simulationResult: simulationResult.value,
      confirmed: !confirmation.value.err,
      confirmationError: confirmation.value.err,
    })
  } catch (err) {
    console.error('Error handling signed stake transaction:', err)
    return createTransactionErrorResponse(err)
  }
}
