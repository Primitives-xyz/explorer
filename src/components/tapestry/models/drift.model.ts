import { PerpPosition, SpotPosition } from "@drift-labs/sdk-browser"

export interface UserStats {
  // User health
  health: number
  healthRatio: number | null

  // Net USD Value
  netUsdValue: number

  // Leverage
  leverage: number

  // Positions
  perpPositions: PerpPosition[]
  spotPositions: SpotPosition[]

  // Trading limits
  maxLeverage: number
  maxTradeSize: number
}