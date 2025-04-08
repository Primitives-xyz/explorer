import { BulkAccountLoader, User } from '@drift-labs/sdk'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { BN } from 'bn.js'
import { NextRequest, NextResponse } from 'next/server'
import { initializeDriftClient } from '../place-perps-order/route'

export const getTokenAddress = (
  mintAddress: string,
  userPubKey: string
): Promise<PublicKey> => {
  return getAssociatedTokenAddress(
    new PublicKey(mintAddress),
    new PublicKey(userPubKey)
  )
}

export async function POST(req: NextRequest) {
  try {
    const { amount, depositeTokenMint, walletAddy } = await req.json()
    const { driftClient, connection, publicKey } = await initializeDriftClient()

    const bulkAccountLoader = new BulkAccountLoader(
      connection,
      'confirmed',
      1000
    )

    const user = new User({
      driftClient: driftClient,
      userAccountPublicKey: new PublicKey(walletAddy),
      accountSubscription: {
        type: 'polling',
        accountLoader: bulkAccountLoader,
      },
    })

    const userAccountExists = await user.exists()

    if (!userAccountExists) {
      const depositAmount = new BN(40000000)

      const env = 'mainnet-beta'

      driftClient.getInitializeUserAccountIxs()

      const ixs =
        await driftClient.createInitializeUserAccountAndDepositCollateralIxs(
          depositAmount,
          await getTokenAddress(depositeTokenMint, walletAddy)
        )

      const blockHash = (await connection.getLatestBlockhash('finalized'))
        .blockhash

      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(walletAddy),
        recentBlockhash: blockHash,
        instructions: ixs.ixs,
      }).compileToV0Message()

      const vtx = new VersionedTransaction(messageV0)

      const serialized = vtx.serialize()
      const buffer = Buffer.from(serialized).toString('base64')

      return NextResponse.json({ initOrderAndDepositeCollateralTx: buffer })
    } else {
      return NextResponse.json({
        error: 'User Account Already exist',
      })
    }
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: String(err) })
  }
}
