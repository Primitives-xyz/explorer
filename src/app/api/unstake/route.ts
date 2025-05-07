import { SseStake } from '@/sse_stake'
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
import { NextRequest, NextResponse } from 'next/server'

function convertToBN(value: number, decimals: number) {
	const wholePart = Math.floor(value)
  const precision = new anchor.BN(Math.pow(10, decimals))
	const decimalPart = Math.round((value - wholePart) * precision.toNumber())
  
	return new anchor.BN(wholePart).mul(precision).add(new anchor.BN(decimalPart))
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddy, amount } = await await req.json()
    const connection = new Connection(process.env.RPC_URL || '')
    const wallet = new NodeWallet(Keypair.generate())
    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: 'confirmed',
    })
    const stakingProgramInterface = JSON.parse(
      JSON.stringify(stakingProgramIdl)
    )
    const program = new anchor.Program(stakingProgramIdl as SseStake, {
      connection,
    })

    const [configPda, _] = PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
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

    const unstakeTx = await program.methods
      .unstake(convertToBN(Number(amount), SSE_TOKEN_DECIMAL))
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
      instructions: unstakeTx.instructions,
    }).compileToV0Message()

    const vtx = new VersionedTransaction(messageV0)
    const serialized = vtx.serialize()
    const buffer = Buffer.from(serialized).toString('base64')

    return NextResponse.json({ unStakeTx: buffer })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: String(err) })
  }
}
