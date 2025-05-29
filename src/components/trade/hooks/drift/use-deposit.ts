import { useCurrentWallet } from '@/utils/use-current-wallet'
import { BN, SpotMarkets } from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'

interface UseInitAccountAndDepositParams {
  amount: string
  depositToken: string
  depositTokenSymbol: string
  depositTokenDecimals: number
  subAccountId: number | null
}

const env = 'mainnet-beta'

const getTokenAddress = async (
  tokenMint: string,
  walletAddress: string
): Promise<PublicKey> => {
  const mint = new PublicKey(tokenMint)
  const owner = new PublicKey(walletAddress)
  return await getAssociatedTokenAddress(mint, owner)
}

export interface DepositCallbacks {
  onLoading?: (message: string) => void
  onSuccess?: (signature: string) => void
  onError?: (error: string) => void
}

export function useDeposit({
  amount,
  depositToken,
  depositTokenSymbol,
  depositTokenDecimals,
  subAccountId,
}: UseInitAccountAndDepositParams) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const depositCollateral = async (callbacks?: DepositCallbacks) => {
    try {
      let isDriftAccountExist = false
      setLoading(true)
      setError(null)

      if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
        const error = 'Please connect a Solana wallet'
        setError(error)
        callbacks?.onError?.(error)
        return
      }

      if (!driftClient) {
        const error = 'Drift client not initialized'
        setError(error)
        callbacks?.onError?.(error)
        return
      }

      await driftClient.subscribe()

      const userTokenAccount =
        depositTokenSymbol === 'SOL'
          ? new PublicKey(walletAddress)
          : await getTokenAddress(depositToken, walletAddress)

      const marketInfo = SpotMarkets[env].find(
        (market) => market.symbol === depositTokenSymbol
      )

      if (!marketInfo) {
        const error = 'Market not found'
        setError(error)
        callbacks?.onError?.(error)
        return
      }

      let signature

      callbacks?.onLoading?.('Please confirm the transaction in your wallet')

      try {
        const user = driftClient.getUser()
        isDriftAccountExist = true
      } catch (error) {
        isDriftAccountExist = false
      }

      if (isDriftAccountExist) {
        if (subAccountId !== null) {
          const sig = await driftClient.deposit(
            new BN(
              Math.floor(Number(amount) * Math.pow(10, depositTokenDecimals))
            ),
            marketInfo.marketIndex,
            userTokenAccount,
            subAccountId
          )
          signature = sig
        } else {
          const sig = await driftClient.deposit(
            new BN(
              Math.floor(Number(amount) * Math.pow(10, depositTokenDecimals))
            ),
            marketInfo.marketIndex,
            userTokenAccount
          )
          signature = sig
        }
      } else {
        const [sig, pubKey] =
          await driftClient.initializeUserAccountAndDepositCollateral(
            new BN(
              Math.floor(Number(amount) * Math.pow(10, depositTokenDecimals))
            ),
            userTokenAccount,
            marketInfo.marketIndex
          )
        signature = sig
      }

      callbacks?.onSuccess?.(signature)

      return {
        signature,
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to deposit collateral'
      setError(errorMessage)
      callbacks?.onError?.(errorMessage)
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
