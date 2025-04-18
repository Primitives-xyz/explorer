import { IUserStats } from '@/components/tapestry/models/drift.model'
import { Input, Switch } from '@/components/ui'
import Image from 'next/image'
import LeverageSelector from './leverage-selector'

interface LimitOrderProps {
  limitPrice: number
  amount: string
  marketPrice: number
  leverageValue: number
  selectedLeverageSizeUsd: string
  selectedLeverageSizeToken: string
  userStats: IUserStats
  swift: boolean
  isSizeByLeverage: boolean
  handleLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleLeverageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setAmount: (amount: string) => void
  setLeverageValue: (leverage: number) => void
  setSwift: (swift: boolean) => void
  setIsSizeByLeverage: (value: boolean) => void
}

export default function LimitOrder({
  limitPrice,
  amount,
  marketPrice,
  leverageValue,
  selectedLeverageSizeUsd,
  selectedLeverageSizeToken,
  userStats,
  swift,
  isSizeByLeverage,
  handleLimitPriceChange,
  handleAmountChange,
  setAmount,
  setSwift,
  setLeverageValue,
  setIsSizeByLeverage,
}: LimitOrderProps) {
  return (
    <div className="space-y-4">
      <p>Limit Price</p>
      <div>
        <div className="relative w-full">
          <Input
            placeholder="0.00"
            className="pr-12 text-primary text-xl"
            value={limitPrice}
            type="number"
            onChange={(e) => handleLimitPriceChange(e)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full">
            USD
          </span>
        </div>
      </div>

      <div className="flex gap-1">
        <div className="relative w-full">
          <Input
            placeholder="0.00"
            className="pr-12 text-primary text-xl"
            type="text"
            onChange={(e) => handleAmountChange(e)}
            value={isSizeByLeverage ? selectedLeverageSizeToken : amount}
          />
          <Image
            src={
              'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
            }
            alt="USDC"
            width={30}
            height={30}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
          />
        </div>

        <div className="relative w-full">
          <Input
            placeholder="0.00"
            value={
              isSizeByLeverage
                ? selectedLeverageSizeUsd
                : (Number(amount) * marketPrice).toFixed(2)
            }
            className="pr-12 text-primary text-xl"
            disabled={true}
          />
          <Image
            src={
              'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
            }
            alt="USDC"
            width={30}
            height={30}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
          />
        </div>
      </div>

      {/* Leverage */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p>Leverage</p>
          <span>{leverageValue.toFixed(2)}x</span>
        </div>

        <LeverageSelector
          min={0}
          max={Math.min(userStats.maxLeverage, 20)}
          setAmount={setAmount}
          leverageValue={leverageValue}
          setLeverageValue={setLeverageValue}
          setIsSizeByLeverage={setIsSizeByLeverage}
        />
      </div>

      <div className="flex items-center space-x-2">
        <p>SWIFT</p>
        <Switch checked={swift} onCheckedChange={setSwift} />
      </div>
    </div>
  )
}
