import { NextRequest, NextResponse } from "next/server";
import { BulkAccountLoader, DriftClient, initialize, PerpMarkets, User } from "@drift-labs/sdk";
import { BN } from "bn.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { TransactionMessage } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import bs58 from "bs58";

export const getTokenAddress = (
  mintAddress: string,
  userPubKey: string
): Promise<PublicKey> => {
  return getAssociatedTokenAddress(
    new PublicKey(mintAddress),
    new PublicKey(userPubKey)
  );
};

const env = 'mainnet-beta'

export async function POST(req: NextRequest) {
  try {
    const { walletAddy, depositeTokenMint } = await req.json()
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
    const connection = new Connection(rpcUrl, 'confirmed')
    const wallet = new NodeWallet(Keypair.generate())

    // Set up the Provider
    const provider = new AnchorProvider(
      connection,
      // @ts-ignore
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

    const user = new User({
      driftClient: driftClient,
      userAccountPublicKey: new PublicKey(walletAddy),
      accountSubscription: {
        type: 'polling',
        accountLoader: bulkAccountLoader,
      },
    });

    const userAccountExists = await user.exists();

    console.log("userAccountExists:", userAccountExists)

    if (!userAccountExists) {
      const depositAmount = new BN(10000000);

      const env = 'mainnet-beta'

      const marketInfo = PerpMarkets[env].find(
        (market) => market.baseAssetSymbol === "SOL"
      )

      console.log("marketIndex:", marketInfo?.marketIndex)
      console.log("depositeTokenMint:", depositeTokenMint)

      const ixs = await driftClient.createInitializeUserAccountAndDepositCollateralIxs(
        depositAmount,
        await getTokenAddress(
          depositeTokenMint,
          walletAddy
        ),
        marketInfo?.marketIndex
      );

      const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash

      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey("AccLkXRzWWyUaTmM3fLJuRcKF5UiEwbXEpiFdmmhQa8X"),
        recentBlockhash: blockHash,
        instructions: ixs.ixs,
      }).compileToV0Message()

      const vtx = new VersionedTransaction(messageV0)

      const simulateTx = await connection.simulateTransaction(vtx, {
        replaceRecentBlockhash: true,
      })

      console.log('Simulation result:', simulateTx)

      return NextResponse.json({ initOrderAndDepositeCollateralTx: "OK" })
    } else {
      return NextResponse.json({ initOrderAndDepositeCollateralTx: "OK" })
    }
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: String(err) })
  }
}