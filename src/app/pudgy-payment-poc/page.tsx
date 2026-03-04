'use client'

import { useCurrentWallet } from '@/utils/use-current-wallet';
import { useState } from 'react';
import { z } from 'zod';
import { createBurnCheckedInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey, Connection } from '@solana/web3.js';
import { VersionedTransaction } from '@solana/web3.js';
import { TransactionMessage } from '@solana/web3.js';
import type { ISolana } from '@dynamic-labs/solana-core'
import { TransactionInstruction } from '@solana/web3.js';
import { SendTransactionError } from '@solana/web3.js';
import { isSolanaWallet } from '@dynamic-labs/solana';

// Define the schema for parsing the API response
const PudgyUpgradeSchema = z.object({
  amount: z.number(),
  tokenSymbol: z.string(),
  memo: z.string(),
});

const PENGU_MINT_ADDRESS = '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv'
const PENGU_DECIMALS = 6

// This component handles fetching data and initiating a Solana burn transaction
export default function PudgyUpgradeComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<z.infer<typeof PudgyUpgradeSchema> | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
	const { walletAddress, primaryWallet, mainProfile } = useCurrentWallet()
  const connectWallet = async () => {
    try {
      if (!walletAddress || !primaryWallet) {
        throw new Error('Wallet not connected')
      }

      setWallet(walletAddress)
      setWalletConnected(true)
    } catch (err) {
      setError('Failed to connect wallet: ' + (err instanceof Error ? err.message : String(err)));
      setIsLoading(false);
    }
  };
  
  // Fetch upgrade data from the API
  const fetchUpgradeData = async () => {
    try {
      setIsLoading(true);
      setError(null);
			if (!mainProfile) {
				throw new Error('No profile found to be upgraded.')
			}
      
			const response = await fetch(`/api/pudgy-profile-upgrade/${mainProfile.id}/init`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      const parsedData = PudgyUpgradeSchema.parse(data);
      
      setTransactionData(parsedData);
      setIsLoading(false);
    } catch (err) {
      console.log('Error fetching transaction data: ', err);
      setError('Error fetching transaction data: '+ err);
      setIsLoading(false);
    }
  };
  
  // Create and send the Solana burn transaction
  const createAndSendBurnTransaction = async () => {
    if (!walletConnected || !transactionData) {
      setError('Wallet not connected or transaction data not available');
      return;
    }

    const SOLANA_CONNECTION = new Connection(
      process.env.NEXT_PUBLIC_RPC_URL 
      || 'https://api.mainnet-beta.solana.com'
    );
    
    try {
      const WALLET_PUBLIC_KEY_FORMAT = new PublicKey(walletAddress);
      const PENGU_PUBLIC_KEY_FORMAT = new PublicKey(PENGU_MINT_ADDRESS);

      setIsLoading(true);
     
      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        throw new Error('Wallet not connected or not a Solana wallet')
      }

      if(!mainProfile) {
        throw new Error('No profile found to be upgraded.')
      }

      console.log(`Creating burn transaction for ${transactionData.amount} ${transactionData.tokenSymbol}`);
      console.log(`Memo: ${transactionData.memo}`);

      console.log(`Step 1 - Fetch Token Account`);
      const account = await getAssociatedTokenAddress(PENGU_PUBLIC_KEY_FORMAT, WALLET_PUBLIC_KEY_FORMAT);
      console.log(`    ✅ - Associated Token Account Address: ${account.toString()}`);

      const amount = Math.ceil(transactionData.amount); // round up to the nearest whole number, so that the transaction ca pass

      const burnIx = createBurnCheckedInstruction(
      account, // PublicKey of Owner's Associated Token Account
      PENGU_PUBLIC_KEY_FORMAT,// Public Key of the Token Mint Address
      WALLET_PUBLIC_KEY_FORMAT, // Public Key of Owner's Wallet
      amount * (10**PENGU_DECIMALS), // Number of tokens to burn
      PENGU_DECIMALS // Number of Decimals of the Token Mint
      );
      console.log(`    ✅ - Burn Instruction Created`);

      console.log(`Step 3 - Fetch Blockhash`);
      const { blockhash } = await SOLANA_CONNECTION.getLatestBlockhash('finalized');
      console.log(`    ✅ - Latest Blockhash: ${blockhash}`);

      const MEMO_PROGRAM_ID = new PublicKey(
        'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
      )
    
      const memoIx = new TransactionInstruction({
        keys: [{ pubkey: WALLET_PUBLIC_KEY_FORMAT, isSigner: true, isWritable: true }],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(transactionData.memo, 'utf-8'),
      })

      console.log(`Step 4 - Assemble Transaction`);
      const messageV0 = new TransactionMessage({
          payerKey: WALLET_PUBLIC_KEY_FORMAT,
          recentBlockhash: blockhash,
          instructions: [burnIx, memoIx],
      }).compileToV0Message()

      const transaction = new VersionedTransaction(messageV0);
      console.log(`    ✅ - Transaction Created`);

      const signer: ISolana = await primaryWallet.getSigner()
      const signedTransaction = await signer.signTransaction(transaction);

      console.log(`Step 5 - Execute & Confirm Transaction`);
      const txid = await SOLANA_CONNECTION.sendTransaction(signedTransaction);
      console.log("    ✅ - Transaction sent to network");
      console.log("🚀 ~ createAndSendBurnTransaction ~ txid:", txid); // must save this to /callback

      await fetch(`/api/pudgy-profile-upgrade/${mainProfile.id}/callback`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
        body: JSON.stringify({
          txSignature: txid,
          txId: transactionData.memo,
          // TODO: PAUL YOU CAN SEND HERE THE GRADIENT.
        }),
			})

    } catch (err) {
      console.log("🚀 ~ createAndSendBurnTransaction ~ err:", err)
      if (err instanceof SendTransactionError) {
        //@ts-ignore
        console.log("🚀 ~ createAndSendBurnTransaction ~ logs:", logs);
      }

      setError('Error creating burn transaction: ' + (err instanceof Error ? err.message : String(err)));
      setError('Error creating burn transaction: ' + (err instanceof SendTransactionError ? err.message : String(err)));
      setIsLoading(false);
    }
  };
  
  // UI for the component
  return (
    <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Solana Token Burn</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {!walletConnected ? (
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-50"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-600">
              Connected: {wallet?.slice(0, 4)}...{wallet?.slice(-4)}
            </p>
          </div>
          
          {!transactionData ? (
            <button
              onClick={fetchUpgradeData}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50"
            >
              {isLoading ? 'Fetching Data...' : 'Fetch Burn Data'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Transaction Details</h3>
                <p className="text-sm text-gray-600">Amount: {transactionData.amount} {transactionData.tokenSymbol}</p>
                <p className="text-sm text-gray-600">Memo: {transactionData.memo}</p>
              </div>
              
              <button
                onClick={createAndSendBurnTransaction}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Burn Tokens'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}