import { IUserStats } from '@/components/tapestry/models/drift.model'
import { Input, Spinner, Switch } from '@/components/ui'
import Image from 'next/image'
import LeverageSelector from './leverage-selector'
import { Slippage } from './slippage'

const SOL_IMG_URI = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
const USDC_IMG_URI = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"

interface Props {
  getMaxTradeAmount: string
  priceLoading: boolean
  amount: string
  marketPrice: number
  leverageValue: number
  slippageExpanded: boolean
  slippageOption: string
  swift: boolean
  userStats: IUserStats
  selectedLeverageSizeUsd: string
  selectedLeverageSizeToken: string
  isSizeByLeverage: boolean
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleLeverageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setLeverageValue: (value: number) => void
  setSlippageExpanded: (value: boolean) => void
  setSlippageOption: (value: string) => void
  handleDynamicSlippage: (e: React.ChangeEvent<HTMLInputElement>) => void
  setSwift: (value: boolean) => void
  setAmount: (value: string) => void
  setIsSizeByLeverage: (value: boolean) => void
}

export default function MarketOrder({
  priceLoading,
  amount,
  marketPrice,
  leverageValue,
  slippageExpanded,
  slippageOption,
  swift,
  userStats,
  getMaxTradeAmount,
  selectedLeverageSizeUsd,
  selectedLeverageSizeToken,
  isSizeByLeverage,
  handleAmountChange,
  setLeverageValue,
  setSlippageExpanded,
  setSlippageOption,
  handleDynamicSlippage,
  setSwift,
  setAmount,
  setIsSizeByLeverage,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Size */}
      <div className="flex justify-between items-center">
        <p>Size</p>
        <div className="flex items-center gap-2">
          <p>Max: {getMaxTradeAmount} USDC</p>
          {priceLoading && <Spinner size={12} />}
        </div>
      </div>

      {/* Market */}
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

      {/* Leverage */}

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

      {/* Swift */}
      {/* <div className="flex items-center space-x-2">
        <p>SWIFT</p>
        <Switch checked={swift} onCheckedChange={setSwift} />
      </div> */}
    </div>
  )
}
