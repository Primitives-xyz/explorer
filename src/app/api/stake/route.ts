import { SseStake } from '@/sse-staking'
import stakingProgramIdl from '@/sse_stake.json'
import { SSE_MINT, SSE_TOKEN_DECIMAL } from '@/utils/constants'
import { getAssociatedTokenAccount } from '@/utils/token'
import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { BN } from 'bn.js'
import { NextRequest, NextResponse } from 'next/server'

function convertToBN(value: number, decimals: number) {
  const wholePart = Math.floor(value)
  const precision = new anchor.BN(Math.pow(10, decimals))
  const decimalPart = Math.round((value - wholePart) * precision.toNumber())
  
  return new anchor.BN(wholePart).mul(precision).add(new anchor.BN(decimalPart))
}

export async function POST(req: NextRequest) {
  try {
    const { amount, walletAddy } = await req.json()

    const connection = new Connection(process.env.RPC_URL || '')
    const wallet = new NodeWallet(Keypair.generate())
    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: 'confirmed',
    })
    anchor.setProvider(provider)
    const stakingProgramInterface = JSON.parse(
      JSON.stringify(stakingProgramIdl)
    )
    const program = new anchor.Program(
      stakingProgramInterface,
      provider
    ) as anchor.Program<SseStake>

    const userTokenAccount = getAssociatedTokenAccount(
      new PublicKey(walletAddy),
      new PublicKey(SSE_MINT)
    )
    const stakeAmount = convertToBN(Number(amount), SSE_TOKEN_DECIMAL)
    const stakeTx = await program.methods
      .stake(stakeAmount)
      .accounts({
        user: new PublicKey(walletAddy),
        userTokenAccount: userTokenAccount,
      })
      .transaction()

    const blockHash = (await connection.getLatestBlockhash('finalized'))
      .blockhash

    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(walletAddy),
      recentBlockhash: blockHash,
      instructions: stakeTx.instructions,
    }).compileToV0Message()

    const vtx = new VersionedTransaction(messageV0)
    const serialized = vtx.serialize()
    const buffer = Buffer.from(serialized).toString('base64')

    return NextResponse.json({ stakeTx: buffer })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: String(err) })
  }
}
