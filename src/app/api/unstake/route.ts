import { getUserIdFromToken, verifyRequestAuth } from '@/utils/auth'
import { SSE_MINT, SSE_TOKEN_DECIMAL } from '@/utils/constants'
import { detectStakingVersion } from '@/utils/staking-version'
import { getAssociatedTokenAccount } from '@/utils/token'
import {
  createTransactionErrorResponse,
  serializeTransactionForClient,
} from '@/utils/transaction-helpers'
import * as anchor from '@coral-xyz/anchor'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

function convertToBN(value: number, decimals: number) {
  const wholePart = Math.floor(value)
  const precision = new anchor.BN(Math.pow(10, decimals))
  const decimalPart = Math.round((value - wholePart) * precision.toNumber())

  return new anchor.BN(wholePart).mul(precision).add(new anchor.BN(decimalPart))
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  console.log('[UNSTAKE] Starting unstake request')

  try {
    // Verify authentication
    console.log('[UNSTAKE] Verifying authentication...')
    const verifiedToken = await verifyRequestAuth(req.headers)
    if (!verifiedToken) {
      console.error('[UNSTAKE] Authentication failed - no verified token')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = getUserIdFromToken(verifiedToken)
    if (!userId) {
      console.error('[UNSTAKE] Invalid authentication token - no userId')
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }
    console.log('[UNSTAKE] Authentication successful, userId:', userId)

    // Parse request body
    let requestBody
    try {
      requestBody = await req.json()
      console.log('[UNSTAKE] Request body:', JSON.stringify(requestBody))
    } catch (parseError) {
      console.error('[UNSTAKE] Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { walletAddy, walletAddress, amount } = requestBody

    // Support both field names for backward compatibility
    const userWallet = walletAddy || walletAddress
    if (!userWallet) {
      console.error('[UNSTAKE] Missing wallet address in request')
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      )
    }

    if (!amount || isNaN(Number(amount))) {
      console.error('[UNSTAKE] Invalid or missing amount:', amount)
      return NextResponse.json(
        { error: 'Invalid or missing amount' },
        { status: 400 }
      )
    }

    console.log(
      '[UNSTAKE] Processing unstake for wallet:',
      userWallet,
      'amount:',
      amount
    )

    const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    console.log('[UNSTAKE] Using RPC URL:', rpcUrl)

    const connection = new Connection(rpcUrl)

    let userPubkey: PublicKey
    try {
      userPubkey = new PublicKey(userWallet)
    } catch (pubkeyError) {
      console.error(
        '[UNSTAKE] Invalid wallet address format:',
        userWallet,
        pubkeyError
      )
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Detect which version to use
    console.log('[UNSTAKE] Detecting staking version...')
    let isNewVersion, program, configPda
    try {
      const versionInfo = await detectStakingVersion(connection, userPubkey)
      isNewVersion = versionInfo.isNewVersion
      program = versionInfo.program
      configPda = versionInfo.configPda

      console.log('[UNSTAKE] Staking version detected:', {
        isNewVersion,
        programId: program.programId.toString(),
        configPda: configPda.toString(),
      })
    } catch (versionError) {
      console.error('[UNSTAKE] Failed to detect staking version:', versionError)
      const errorMessage =
        versionError instanceof Error
          ? versionError.message
          : String(versionError)
      throw new Error(`Failed to detect staking version: ${errorMessage}`)
    }

    console.log(
      `[UNSTAKE] Using ${
        isNewVersion ? 'new' : 'old'
      } staking contract for unstake`
    )

    // Get user token account
    console.log('[UNSTAKE] Getting user token account...')
    const userTokenAccount = getAssociatedTokenAccount(
      userPubkey,
      new PublicKey(SSE_MINT)
    )
    console.log('[UNSTAKE] User token account:', userTokenAccount.toString())

    // Convert amount to BN
    const amountBN = convertToBN(Number(amount), SSE_TOKEN_DECIMAL)
    console.log('[UNSTAKE] Amount in BN:', amountBN.toString())

    // Build transaction based on version
    console.log('[UNSTAKE] Building unstake transaction...')
    let unstakeTx: Transaction

    try {
      if (isNewVersion) {
        // New version needs globalTokenAccount
        console.log(
          '[UNSTAKE] Using new version - getting global token account...'
        )
        const globalTokenAccount = await getAssociatedTokenAccount(
          configPda,
          new PublicKey(SSE_MINT)
        )
        console.log(
          '[UNSTAKE] Global token account:',
          globalTokenAccount.toString()
        )

        console.log('[UNSTAKE] Building new version unstake transaction...')
        unstakeTx = await (program.methods as any)
          .unstake(amountBN)
          .accounts({
            globalTokenAccount,
            user: userPubkey,
            userTokenAccount,
          })
          .transaction()
      } else {
        // Old version doesn't need globalTokenAccount
        console.log('[UNSTAKE] Building old version unstake transaction...')
        unstakeTx = await (program.methods as any)
          .unstake(amountBN)
          .accounts({
            user: userPubkey,
            userTokenAccount,
          })
          .transaction()
      }

      console.log('[UNSTAKE] Transaction built successfully')
    } catch (txBuildError) {
      console.error('[UNSTAKE] Failed to build transaction:', txBuildError)
      const errorDetails =
        txBuildError instanceof Error
          ? {
              name: txBuildError.name,
              message: txBuildError.message,
              stack: txBuildError.stack,
            }
          : { message: String(txBuildError) }
      console.error('[UNSTAKE] Error details:', errorDetails)
      const errorMessage =
        txBuildError instanceof Error
          ? txBuildError.message
          : String(txBuildError)
      throw new Error(`Failed to build unstake transaction: ${errorMessage}`)
    }

    // Serialize transaction
    console.log('[UNSTAKE] Serializing transaction...')
    let serializedTx
    try {
      serializedTx = await serializeTransactionForClient(
        unstakeTx,
        connection,
        userPubkey
      )
      console.log('[UNSTAKE] Transaction serialized successfully')
    } catch (serializeError) {
      console.error(
        '[UNSTAKE] Failed to serialize transaction:',
        serializeError
      )
      const errorMessage =
        serializeError instanceof Error
          ? serializeError.message
          : String(serializeError)
      throw new Error(`Failed to serialize transaction: ${errorMessage}`)
    }

    const processingTime = Date.now() - startTime
    console.log(
      `[UNSTAKE] Request completed successfully in ${processingTime}ms`
    )

    return NextResponse.json({ unStakeTx: serializedTx })
  } catch (err) {
    const processingTime = Date.now() - startTime
    console.error(`[UNSTAKE] Request failed after ${processingTime}ms`)
    console.error('[UNSTAKE] Error:', err)
    const errorDetails =
      err instanceof Error
        ? {
            name: err.name,
            message: err.message,
            stack: err.stack,
            cause: err.cause,
          }
        : { message: String(err) }
    console.error('[UNSTAKE] Error details:', errorDetails)

    return createTransactionErrorResponse(err)
  }
}
