import { SseStake } from '@/sse_stake'
import stakingProgramIdl from '@/sse_stake.json'
import { SSE_MINT } from '@/utils/constants'
import { getAssociatedTokenAccount } from '@/utils/token'
import * as anchor from '@coral-xyz/anchor'
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

// The seed used for finding the config PDA
const SEED_CONFIG = 'config'

export async function POST(req: NextRequest) {
  try {
    const { walletAddy } = await req.json()
    const connection = new Connection(process.env.RPC_URL || '')
    const program = new anchor.Program(stakingProgramIdl as SseStake, {
      connection,
    })

    const [configPda, _] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_CONFIG)],
      program.programId
    )

    let globalTokenAccount = await getAssociatedTokenAccount(
      configPda,
      new PublicKey(SSE_MINT)
    )
    let userTokenAccount = await getAssociatedTokenAccount(
      new PublicKey(walletAddy),
      new PublicKey(SSE_MINT)
    )

    const claimRewardTx = await program.methods
      .claimReward()
      .accounts({
        globalTokenAccount,
        user: new PublicKey(walletAddy),
        userTokenAccount,
      })
      .transaction()

    const blockHash = (await connection.getLatestBlockhash('finalized'))
      .blockhash

    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(walletAddy),
      recentBlockhash: blockHash,
      instructions: claimRewardTx.instructions,
    }).compileToV0Message()

    const vtx = new VersionedTransaction(messageV0)
    const serialized = vtx.serialize()
    const buffer = Buffer.from(serialized).toString('base64')

    return NextResponse.json({ claimRewardTx: buffer })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: String(err) })
  }
}
