export interface SolidScoreResponse {
  solidUser: {
    solidScore: number
    badges: any[]
    tierGroup: string
    dataPoints: {
      solidUserId: number
      feesPaid: number
      txnsPlaced: number
      walletAge: number
      activeDays: number
      portfolioUsdValue: number
      portfolioUsdVolumeByToken: number
      portfolioUsdVolumeByTokenCategory: number
      dexHistoricalTxnVolume: number
      dexRecentTxnVolume: number
      dexHistoricalUsdVolume: number
      dexRecentUsdVolume: number
      dexTxnVolumeByProvider: number
      dexUsdVolumeByProvider: number
      dexPnlPerformance: number
      nftHistoricalBuyTxnVolume: number
      nftRecentBuyTxnVolume: number
      nftHistoricalBuyUsdVolume: number
      nftRecentBuyUsdVolume: number
      nftBuyTxnVolumeByCollection: number
      nftBuyUsdVolumeByCollection: number
      nftBuyTxnVolumeByMarketplace: number
      nftBuyUsdVolumeByMarketplace: number
      lpHistoricalUsdVolumeByDuration: number
      lpActiveUsdVolume: number
      lpUsdDepositVolumeByProgram: number
      lpUsdDepositVolumeByPool: number
      nativeStakingHistoricalSolVolumeByDuration: number
      nativeStakingActiveSolVolume: number
      updatedAt: string
      rawData: {
        feesPaid: number
        txnsPlaced: number
        walletAge: number
        activeDays: number
        portfolioUsdValue: number
        portfolioUsdVolumeByToken: Record<string, number>
        portfolioUsdVolumeByTokenCategory: Record<string, number>
        dexHistoricalTxnVolume: number
        dexRecentTxnVolume: number
        dexHistoricalUsdVolume: number
        dexRecentUsdVolume: number
        dexTxnVolumeByProvider: Record<string, number>
        dexUsdVolumeByProvider: Record<string, number>
        dexPnlPerformance: number
        nftHistoricalBuyTxnVolume: number
        nftRecentBuyTxnVolume: number
        nftHistoricalBuyUsdVolume: number
        nftRecentBuyUsdVolume: number
        nftBuyTxnVolumeByCollection: Record<string, number>
        nftBuyUsdVolumeByCollection: Record<string, number>
        nftBuyTxnVolumeByMarketplace: Record<string, number>
        nftBuyUsdVolumeByMarketplace: Record<string, number>
        lpHistoricalUsdVolumeByDuration: number
        lpActiveUsdVolume: number
        lpUsdDepositVolumeByProgram: Record<string, number>
        lpUsdDepositVolumeByPool: Record<string, number>
        nativeStakingHistoricalSolVolumeByDuration: number
        nativeStakingActiveSolVolume: number
      }
    }
    isSolanaIdUser: boolean
  }
  status: string
}
