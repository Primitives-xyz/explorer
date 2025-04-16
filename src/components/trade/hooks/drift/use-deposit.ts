import { BN, DriftClient, PerpMarkets, SpotMarkets, SpotMarketConfig, BulkAccountLoader, User } from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface UseInitAccountAndDepositParams {
  amount: string
  depositToken: string
  depositTokenSymbol: string
  depositTokenDecimals: number
}

const env = 'mainnet-beta'

export const getTokenAddress = (
  mintAddress: string,
  userPubKey: string
): Promise<PublicKey> => {
  return getAssociatedTokenAddress(
    new PublicKey(mintAddress),
    new PublicKey(userPubKey)
  );
};

export function useDeposit({
  amount,
  depositToken,
  depositTokenSymbol,
  depositTokenDecimals
}: UseInitAccountAndDepositParams) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const depositCollateral = async () => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError('Wallet not connected')
      return
    }

    setLoading(true)
    try {
      if (!driftClient) {
        setError('Drift client not initialized')
        return
      }
      await driftClient.subscribe()

      const userTokenAccount = depositTokenSymbol === 'SOL' ? new PublicKey(walletAddress) : await getTokenAddress(depositToken, walletAddress)

      const marketInfo = SpotMarkets[env].find(
        (market) => market.symbol === depositTokenSymbol
      )

      if (!marketInfo) {
        setError('Market not found')
        return
      }

      let signature;

      try {
        driftClient.getUser()
        const sig = await driftClient.deposit(
          new BN(Math.floor(Number(amount) * Math.pow(10, depositTokenDecimals))),
          marketInfo.marketIndex,
          userTokenAccount,
        )
        signature = sig
      } catch (error) {
        const [sig, pubKey] = await driftClient.initializeUserAccountAndDepositCollateral(
          new BN(Math.floor(Number(amount) * Math.pow(10, depositTokenDecimals))),
          userTokenAccount,
          marketInfo.marketIndex
        )
        console.log("sig", sig)
        console.log("pubKey", pubKey.toBase58())
        signature = sig
      }

      return {
        signature,
      }
    } catch (error) {
      console.error(error)
      setError('Failed to initialize user account and deposit collateral')
      return {
        signature: null,
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    depositCollateral,
    loading,
    error,
  }
}