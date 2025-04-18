import { Connection, Keypair } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import { Wallet, BN } from "@coral-xyz/anchor";


import { VertigoSDK } from "@vertigo-amm/vertigo-sdk";
import fs from "node:fs";


export async function createConnection() {
  const url = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  if (!url) {
    throw new Error("SOLANA_RPC_URL is not set");
  }
  return new Connection(url, "confirmed");
}

export async function launchPool(connection: Connection, walletKeypair: Keypair) {
  // const wallet = new NodeWallet(walletKeypair);
  const wallet = new Wallet(
    Keypair.fromSecretKey(
      Buffer.from(
        JSON.parse(
          fs.readFileSync(`${process.env.HOME}/.config/solana/id.json`, "utf-8")
        )
      )
    )
  );
  const vertigo = new VertigoSDK(connection, wallet);
  console.log("SDK INITIALIZED");
  return vertigo

  // Initialize the SPL Token factory with 100 virtual SOL and 1B supply of token
  // await vertigo.SPLTokenFactory.initialize({
}

// async function main() {
//   const url = "https://api.devnet.solana.com";

//   if (!url) {
//     throw new Error("SOLANA_RPC_URL is not set");
//   }

//   const connection = new Connection(url, "confirmed");

//   // Load wallet from path
//   const wallet = new Wallet(
//     Keypair.fromSecretKey(
//       Buffer.from(
//         JSON.parse(
//           fs.readFileSync(`${process.env.HOME}/.config/solana/id.json`, "utf-8")
//         )
//       )
//     )
//   );

//   const vertigo = new VertigoSDK(connection, wallet);
//   console.log("SDK INITIALIZED");

//   // Initialize the SPL Token factory with 100 virtual SOL and 1B supply of token
//   // await vertigo.SPLTokenFactory.initialize({
//   //   payer: wallet.payer,
//   //   owner: wallet.payer,
//   //   mintA: NATIVE_MINT,
//   //   params: {
//   //     shift: new BN(100_000_000_000),
//   //     initialTokenReserves: new BN(1_000_000_000_000_000),
//   //     feeParams: {
//   //       normalizationPeriod: new BN(25),
//   //       decay: 10,
//   //       royaltiesBps: 100,
//   //     },
//   //     tokenParams: {
//   //       decimals: 6,
//   //       mutable: false,
//   //     },
//   //     nonce: 15,
//   //   },
//   // });

//   // Launch the token
//   // const mintB = Keypair.generate();
//   // const mintBAuthority = Keypair.generate();

//   // const launch = await vertigo.SPLTokenFactory.launch({
//   //   payer: wallet.payer,
//   //   owner: owner,
//   //   mintA: NATIVE_MINT,
//   //   mintB: mintB,
//   //   mintBAuthority: mintBAuthority,
//   //   tokenProgramA: TOKEN_PROGRAM_ID,
//   //   params: {
//   //     tokenConfig: {
//   //       name: "Apple Lion Dog",
//   //       symbol: "ALD",
//   //       uri: "",
//   //     },
//   //     reference: new BN(0),
//   //     privilegedSwapper: wallet.payer.publicKey,
//   //     nonce: 15,
//   //   },
//   // });
//   // console.log(launch);

//   // Quote the buy
//   // const quote = await vertigo.quoteBuy({
//   //   user: wallet.payer.publicKey,
//   //   owner: owner.publicKey,
//   //   mintA: NATIVE_MINT,
//   //   mintB: new PublicKey("<YOUR MINT ADDRESS>"),
//   //   params: {
//   //     amount: new BN(10000),
//   //     limit: new BN(0),
//   //   },
//   // });
//   // console.log({
//   //   newReservesA: Number(quote.newReservesA),
//   //   newReservesB: Number(quote.newReservesB),
//   //   amountA: Number(quote.amountA),
//   //   amountB: Number(quote.amountB),
//   //   feeA: Number(quote.feeA),
//   // });
// }

// main();
