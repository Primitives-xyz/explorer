import { SSE_MINT, SSE_TOKEN_DECIMAL } from '@/utils/constants'
import { detectStakingVersion } from '@/utils/staking-version'
import { getAssociatedTokenAccount } from '@/utils/token'
import {
  createTransactionErrorResponse,
  serializeTransactionForClient,
} from '@/utils/transaction-helpers'
import { verifyRequestAuth, getUserIdFromToken } from '@/utils/auth'
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
  try {
    // Verify authentication
    const verifiedToken = await verifyRequestAuth(req.headers)
    if (!verifiedToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = getUserIdFromToken(verifiedToken)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const { walletAddy, walletAddress, amount } = await req.json()

    // Support both field names for backward compatibility
    const userWallet = walletAddy || walletAddress
    if (!userWallet) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      )
    }

    const connection = new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    )

    const userPubkey = new PublicKey(userWallet)

    // Detect which version to use
    const { isNewVersion, program, configPda } = await detectStakingVersion(
      connection,
      userPubkey
    )

    console.log(
      `Using ${isNewVersion ? 'new' : 'old'} staking contract for unstake`
    )

    const userTokenAccount = getAssociatedTokenAccount(
      userPubkey,
      new PublicKey(SSE_MINT)
    )

    // Build transaction based on version
    let unstakeTx: Transaction
    if (isNewVersion) {
      // New version needs globalTokenAccount
      const globalTokenAccount = await getAssociatedTokenAccount(
        configPda,
        new PublicKey(SSE_MINT)
      )

      unstakeTx = await (program.methods as any)
        .unstake(convertToBN(Number(amount), SSE_TOKEN_DECIMAL))
        .accounts({
          globalTokenAccount,
          user: userPubkey,
          userTokenAccount,
        })
        .transaction()
    } else {
      // Old version doesn't need globalTokenAccount
      unstakeTx = await (program.methods as any)
        .unstake(convertToBN(Number(amount), SSE_TOKEN_DECIMAL))
        .accounts({
          user: userPubkey,
          userTokenAccount,
        })
        .transaction()
    }

    // Use our helper to serialize the transaction
    const serializedTx = await serializeTransactionForClient(
      unstakeTx,
      connection,
      userPubkey
    )

    return NextResponse.json({ unStakeTx: serializedTx })
  } catch (err) {
    return createTransactionErrorResponse(err)
  }
}
