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
  try {
    const { amount, walletAddy, walletAddress } = await req.json()

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
