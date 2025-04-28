import { useState } from "react";
import { useInitializeDrift } from "./use-initialize-drift";
import { BN, convertToNumber, PerpMarkets, SpotMarkets } from "@drift-labs/sdk-browser";

interface UseWithdrawProps {
  subAccountId: number
  tokenSymbol: string
}

export function useWithdraw({
  subAccountId,
  tokenSymbol,
}: UseWithdrawProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const { driftClient } = useInitializeDrift()
  const marketInfo = SpotMarkets['mainnet-beta'].find(
    (market) => market.symbol === tokenSymbol
  )

  const withDraw = async () => {
    try {
      setLoading(true)

      if (!driftClient) {
        console.log("No Drift Client")
        return
      }

      if (!marketInfo) {
        console.log("No Market")
        return
      }

      await driftClient.subscribe()
      const user = driftClient.getUser(subAccountId)
      const pubkey = user.userAccountPublicKey
      console.log("pubkey:", pubkey.toBase58())
      // const withdrawalLimit = user.getWithdrawalLimit(marketInfo.marketIndex)
      const withdrawalLimit = user.getTotalCollateral()
      console.log("totalCollateral:", convertToNumber(withdrawalLimit, new BN(10).pow(new BN(9))))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return {
    withDraw,
    loading
  }
}