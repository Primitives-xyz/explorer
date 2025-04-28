import { useState } from 'react'
import { BN, SpotMarkets } from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'
import { useInitializeDrift } from './use-initialize-drift'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useToastContent } from './use-toast-content'

interface UseInitAccountAndDepositParams {
  amount: string
  depositToken: string
  depositTokenSymbol: string
  depositTokenDecimals: number
  subAccountId: number | null
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
  depositTokenDecimals,
  subAccountId
}: UseInitAccountAndDepositParams) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const { ERRORS, LOADINGS, SUCCESS } = useToastContent()

  const depositCollateral = async () => {
    try {
      let isDriftAccountExist = false
      setLoading(true)
      if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
        toast.error(ERRORS.WALLET_CONNETION_ERR.title, ERRORS.WALLET_CONNETION_ERR.content)

        return
      }

      if (!driftClient) {
        toast.error(ERRORS.DRIFT_CLIENT_INIT_ERR.title, ERRORS.DRIFT_CLIENT_INIT_ERR.content)
        return
      }
      await driftClient.subscribe()

      const userTokenAccount = depositTokenSymbol === 'SOL' ? new PublicKey(walletAddress) : await getTokenAddress(depositToken, walletAddress)

      const marketInfo = SpotMarkets[env].find(
        (market) => market.symbol === depositTokenSymbol
      )

      if (!marketInfo) {
        toast.error(ERRORS.PERPS_MARKET_ERR.title, ERRORS.PERPS_MARKET_ERR.content)
        return
      }

      let signature;

      toast.loading(LOADINGS.CONFIRM_LOADING.title, LOADINGS.CONFIRM_LOADING.content)

      try {
        const user = driftClient.getUser()
        isDriftAccountExist = true
      } catch (error) {
        isDriftAccountExist = false
      }

      if (isDriftAccountExist) {
        if (subAccountId !== null) {
          const sig = await driftClient.deposit(
            new BN(Math.floor(Number(amount) * Math.pow(10, depositTokenDecimals))),
            marketInfo.marketIndex,
            userTokenAccount,
            subAccountId
          )
          signature = sig
        } else {
          const sig = await driftClient.deposit(
            new BN(Math.floor(Number(amount) * Math.pow(10, depositTokenDecimals))),
            marketInfo.marketIndex,
            userTokenAccount,
          )
          signature = sig
        }
      } else {
        const [sig, pubKey] = await driftClient.initializeUserAccountAndDepositCollateral(
          new BN(Math.floor(Number(amount) * Math.pow(10, depositTokenDecimals))),
          userTokenAccount,
          marketInfo.marketIndex,
        )
        signature = sig
      }

      toast.dismiss()
      toast.success(SUCCESS.DEPOSIT_COLLATERAL_TX_SUCCESS.title, SUCCESS.DEPOSIT_COLLATERAL_TX_SUCCESS.content)

      return {
        signature,
      }
    } catch (error) {
      toast.dismiss()
      toast.error(ERRORS.TX_DEPOSIT_COLLATERAL_ERR.title, ERRORS.TX_DEPOSIT_COLLATERAL_ERR.content)
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