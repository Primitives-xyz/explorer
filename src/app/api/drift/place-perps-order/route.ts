import { AnchorProvider } from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import {
  BASE_PRECISION,
  BulkAccountLoader,
  DriftClient,
  PerpMarkets,
  PositionDirection,
  getMarketOrderParams,
  initialize,
} from '@drift-labs/sdk'
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { BN } from 'bn.js'
import { NextRequest, NextResponse } from 'next/server'

const env = 'mainnet-beta'

export async function initializeDriftClient() {
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
  const connection = new Connection(rpcUrl, 'confirmed')
  const wallet = new NodeWallet(Keypair.generate())

  // Set up the Provider
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  )

  const sdkConfig = initialize({ env })

  const driftPublicKey = new PublicKey(sdkConfig.DRIFT_PROGRAM_ID)
  const bulkAccountLoader = new BulkAccountLoader(
    provider.connection,
    'confirmed',
    1000
  )

  const driftClient = new DriftClient({
    connection: connection,
    wallet: provider.wallet,
    programID: driftPublicKey,
    env,
    accountSubscription: {
      type: 'polling',
      accountLoader: bulkAccountLoader,
    },
  })

  await driftClient.subscribe()

  return {
    driftClient,
    connection,
    publicKey: provider.wallet.publicKey,
  }
}

export async function POST(req: NextRequest) {
  try {
    const { amount, depositeTokenSymbol, walletAddy } = await req.json()

    const { driftClient, connection, publicKey } = await initializeDriftClient()

    const marketInfo = PerpMarkets[env].find(
      (market) => market.baseAssetSymbol === depositeTokenSymbol
    )

    if (!marketInfo) {
      return NextResponse.json({
        error: 'No Market Info for selected deposite tokens',
        status: 400,
      })
    }

    const marketIndex = marketInfo.marketIndex

    const ixs = await driftClient.getPlacePerpOrderIx(
      getMarketOrderParams({
        baseAssetAmount: new BN(amount).mul(BASE_PRECISION),
        direction: PositionDirection.LONG,
        marketIndex,
      })
    )

    const blockHash = (await connection.getLatestBlockhash('finalized'))
      .blockhash

    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(walletAddy),
      recentBlockhash: blockHash,
      instructions: [ixs],
    }).compileToV0Message()

    const vtx = new VersionedTransaction(messageV0)
    const serialized = vtx.serialize()
    const buffer = Buffer.from(serialized).toString('base64')

    return NextResponse.json({ placePerpOrderTx: buffer })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: String(err) })
  }
}
