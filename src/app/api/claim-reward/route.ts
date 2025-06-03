import { SSE_MINT } from '@/utils/constants'
import { detectStakingVersion } from '@/utils/staking-version'
import { getAssociatedTokenAccount } from '@/utils/token'
import {
  createTransactionErrorResponse,
  serializeTransactionForClient,
} from '@/utils/transaction-helpers'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { walletAddy, walletAddress } = await req.json()

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
      `Using ${isNewVersion ? 'new' : 'old'} staking contract for claim reward`
    )

    const userTokenAccount = getAssociatedTokenAccount(
      userPubkey,
      new PublicKey(SSE_MINT)
    )

    // Build transaction based on version
    let claimRewardTx: Transaction
    if (isNewVersion) {
      // New version needs globalTokenAccount
      const globalTokenAccount = await getAssociatedTokenAccount(
        configPda,
        new PublicKey(SSE_MINT)
      )

      claimRewardTx = await (program.methods as any)
        .claimReward()
        .accounts({
          globalTokenAccount,
          user: userPubkey,
          userTokenAccount,
        })
        .transaction()
    } else {
      // Old version doesn't need globalTokenAccount
      claimRewardTx = await (program.methods as any)
        .claimReward()
        .accounts({
          user: userPubkey,
          userTokenAccount,
        })
        .transaction()
    }

    // Use our helper to serialize the transaction
    const serializedTx = await serializeTransactionForClient(
      claimRewardTx,
      connection,
      userPubkey
    )

    return NextResponse.json({ claimRewardTx: serializedTx })
  } catch (err) {
    return createTransactionErrorResponse(err)
  }
}
