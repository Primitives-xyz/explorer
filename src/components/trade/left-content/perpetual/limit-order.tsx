import { IUserStats } from '@/components/tapestry/models/drift.model'
import { Input, Spinner, Switch } from '@/components/ui'
import Image from 'next/image'
import LeverageSelector from './leverage-selector'
import { Slippage } from './slippage'

interface LimitOrderProps {
  limitPrice: string
  amount: string
  marketPrice: number
  marketPriceLoading: boolean
  leverageValue: number
  selectedLeverageSizeUsd: string
  selectedLeverageSizeToken: string
  userStats: IUserStats
  swift: boolean
  reduceOnly: boolean
  isSizeByLeverage: boolean
  slippageExpanded: boolean
  slippageOption: string
  handleLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleLeverageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDynamicSlippage: (e: React.ChangeEvent<HTMLInputElement>) => void
  setSlippageExpanded: (value: boolean) => void
  setSlippageOption: (value: string) => void
  setAmount: (amount: string) => void
  setLeverageValue: (leverage: number) => void
  setSwift: (swift: boolean) => void
  setReduceOnly: (reduceOnly: boolean) => void
  setIsSizeByLeverage: (value: boolean) => void
}

const SOL_IMG_URI = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
const USDC_IMG_URI = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"

export default function LimitOrder({
  limitPrice,
  amount,
  marketPrice,
  marketPriceLoading,
  leverageValue,
  selectedLeverageSizeUsd,
  selectedLeverageSizeToken,
  userStats,
  swift,
  reduceOnly,
  isSizeByLeverage,
  slippageExpanded,
  slippageOption,
  handleLimitPriceChange,
  handleAmountChange,
  handleDynamicSlippage,
  setAmount,
  setSwift,
  setReduceOnly,
  setLeverageValue,
  setIsSizeByLeverage,
  setSlippageExpanded,
  setSlippageOption
}: LimitOrderProps) {
  return (
    <div className="space-y-4">
      <div className='flex justify-between items-center'>
        <span>Market Price</span>
        <div className="flex items-center gap-2">
          <p className='text-primary'>{marketPrice.toFixed(4)} USD</p>
          {marketPriceLoading && <Spinner size={12} />}
        </div>
      </div>

      <p>Limit Price</p>
      <div>
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="0.00"
            className="pr-12 text-primary text-xl"
            value={limitPrice}
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
            type="text"
            className="pr-12 text-primary text-xl"
            onChange={(e) => handleAmountChange(e)}
            value={isSizeByLeverage ? selectedLeverageSizeToken : amount}
          />
          <Image
            src={SOL_IMG_URI}
            alt="USDC"
            width={25}
            height={25}
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
            className="pr-10 text-primary text-xl"
            disabled={true}
          />
          <Image
            src={USDC_IMG_URI}
            alt="USDC"
            width={25}
            height={25}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
          />
        </div>
      </div>

      {
        userStats.maxLeverage ? (
          <LeverageSelector
            min={0}
            max={Math.min(userStats.maxLeverage, 20)}
            setAmount={setAmount}
            leverageValue={leverageValue}
            setLeverageValue={setLeverageValue}
            setIsSizeByLeverage={setIsSizeByLeverage}
          />
        ) : (<></>)
      }

      <Slippage
        handleDynamicSlippage={handleDynamicSlippage}
        setSlippageExpanded={setSlippageExpanded}
        setSlippageOption={setSlippageOption}
        slippageExpanded={slippageExpanded}
        slippageOption={slippageOption}
      />

      <div className="flex items-center space-x-2">
        <p>Reduce Only</p>
        <Switch checked={reduceOnly} onCheckedChange={setReduceOnly} />
      </div>
    </div>
  )
}
