import { BN, DriftClient, PerpMarkets, SpotMarkets, SpotMarketConfig, BulkAccountLoader, User, PositionDirection, getMarketOrderParams, calculateBidAskPrice, convertToNumber, PRICE_PRECISION } from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { useInitializeDrift } from './use-initialize-drift'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface UsePlacePerpsOrderParams {
  amount: string
  symbol: string
  direction: PositionDirection
}

const env = 'mainnet-beta'

export function usePlacePerpsOrder({
  amount,
  symbol,
  direction,
}: UsePlacePerpsOrderParams) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { driftClient } = useInitializeDrift()
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const placePerpsOrder = async () => {
    setError(null)
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError('Wallet not connected')
      return
    }

    if (Number(amount) <= 0.01) {
      setError('Order size must be at least 0.01 SOL')
      return  
    }

    setLoading(true)
    try {
      if (!driftClient) {
        setError('Drift client not initialized')
        return
      }

      await driftClient.subscribe()
      const user = driftClient.getUser()

      user.subscribe

      const marketInfo = PerpMarkets[env].find(
        (market) => market.baseAssetSymbol === symbol
      )

      if (!marketInfo) {
        setError('Market not found')
        return
      }

      const marketIndex = marketInfo.marketIndex;
      const perpMarketAccount = driftClient.getPerpMarketAccount(marketIndex);
      if (!perpMarketAccount) {
        setError('Perp market account not found');
        return;
      }
      // Get vAMM bid and ask price
      const [bid, ask] = calculateBidAskPrice(
        perpMarketAccount.amm,
        driftClient.getOracleDataForPerpMarket(marketIndex)
      );

      const formattedBidPrice = convertToNumber(bid, PRICE_PRECISION);
      const formattedAskPrice = convertToNumber(ask, PRICE_PRECISION);

      console.log(
        env,
        `vAMM bid: $${formattedBidPrice} and ask: $${formattedAskPrice}`
      );

      const solMarketAccount = driftClient.getPerpMarketAccount(
        marketInfo.marketIndex
      );

      if (!solMarketAccount) {
        setError('Sol market account not found');
        return;
      }

      const txSig = await driftClient.placePerpOrder(
        getMarketOrderParams({
          baseAssetAmount: driftClient.convertToPerpPrecision(Number(amount)),
          direction: direction,
          marketIndex: solMarketAccount.marketIndex,
        })
      );

    } catch (error) {
      setError(`Failed to Place Perps Order.\nPlease try again later.`)
      console.log(error)
      return
    } finally {
      setLoading(false)
    }
  }

  return {
    placePerpsOrder,
    loading,
    error,
    setError
  }
}