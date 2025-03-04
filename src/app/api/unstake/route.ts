import { Connection, Keypair } from "@solana/web3.js"
import stakingProgramIdl from "@/statking_contract_idl.json"
import * as anchor from "@coral-xyz/anchor"
import { SSEStaking } from "@/sse-staking"
import { PublicKey } from "@solana/web3.js"
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet"
import { NextRequest, NextResponse } from "next/server"
import { SSE_MINT, SSE_TOKEN_DECIMAL } from "@/components/trading/constants"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { BN } from "bn.js"
import { TransactionMessage } from "@solana/web3.js"
import { VersionedTransaction } from "@solana/web3.js"

export const getAssociatedTokenAccount = (
    ownerPubkey: PublicKey,
    mintPk: PublicKey
): PublicKey => {
    let associatedTokenAccountPubkey = (PublicKey.findProgramAddressSync(
        [
            ownerPubkey.toBytes(),
            TOKEN_PROGRAM_ID.toBytes(),
            mintPk.toBytes(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0]

    return associatedTokenAccountPubkey
}
export async function POST(req: NextRequest) {
    try {
        const { walletAddy } = await await req.json()
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
        const wallet = new NodeWallet(Keypair.generate())
        const provider = new anchor.AnchorProvider(connection, wallet, {
            preflightCommitment: "confirmed",
        })
        anchor.setProvider(provider)
        const stakingProgramInterface = JSON.parse(JSON.stringify(stakingProgramIdl))
        const program = new anchor.Program(
            stakingProgramInterface,
            provider
        ) as anchor.Program<SSEStaking>

        const [configPda, _] = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            program.programId
        );

        let globalTokenAccount = await getAssociatedTokenAccount(configPda, new PublicKey(SSE_MINT));
        let userTokenAccount = await getAssociatedTokenAccount(new PublicKey(walletAddy), new PublicKey(SSE_MINT));

        const unstakeTx = await program.methods.unstake().accounts({
            globalTokenAccount,
            user: new PublicKey(walletAddy),
            userTokenAccount
        }).transaction();

        const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash

        const messageV0 = new TransactionMessage({
            payerKey: new PublicKey(walletAddy),
            recentBlockhash: blockHash,
            instructions: unstakeTx.instructions,
        }).compileToV0Message()

        const vtx = new VersionedTransaction(messageV0)
        const serialized = vtx.serialize()
        const buffer = Buffer.from(serialized).toString("base64")

        return NextResponse.json({ unStakeTx: buffer })

    } catch (err) {
        console.log(err)
        return NextResponse.json({ error: String(err) })
    }
}