import { IUserStats } from '@/components/tapestry/models/drift.model'
import {
  Button,
  ButtonVariant,
  Card,
  Input,
  Spinner,
  Switch,
} from '@/components/ui'
import { cn } from '@/utils/utils'
import {
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Infinity,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import LeverageSelector from './leverage-selector'

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
  error: string | null
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

const slippageOptions = [
  { value: '0.1', label: '0.1%' },
  { value: '0.5', label: '0.5%' },
  { value: '1', label: '1%' },
  { value: 'zap', icon: <Zap size={16} /> },
  { value: 'infinity', icon: <Infinity size={16} /> },
]

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
  error,
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
    <div className="space-y-6">
      {/* Size */}
      <div className="flex justify-between items-center">
        <p>Size</p>
        <div className="flex items-center gap-2">
          <p>Max: {getMaxTradeAmount} USDC</p>
          {priceLoading && <Spinner size={12} />}
        </div>
      </div>

      {/* Market */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full">
          <Image
            src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
            alt="USDC"
            width={25}
            height={25}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
          />
          <Input
            placeholder="0.00"
            type="text"
            className="pl-12 text-primary text-xl"
            onChange={(e) => handleAmountChange(e)}
            value={isSizeByLeverage ? selectedLeverageSizeToken : amount}
          />
        </div>

        <div className="relative w-full">
          <Image
            src={
              'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
            }
            alt="USDC"
            width={25}
            height={25}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
          />
          <Input
            placeholder="0.00"
            value={
              isSizeByLeverage
                ? selectedLeverageSizeUsd
                : (Number(amount) * marketPrice).toFixed(2)
            }
            className="pl-12 text-primary text-xl"
            disabled={true}
          />
        </div>
      </div>

      {/* Leverage */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p>Leverage</p>
          <p>{leverageValue.toFixed(2)}x</p>
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

      {/* Slippage Tolerance */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between w-full cursor-pointer"
          onClick={() => setSlippageExpanded(!slippageExpanded)}
        >
          <span>Slippage Tolerance (Dynamic)</span>
          {slippageExpanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>

        {slippageExpanded && (
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2">
              {slippageOptions.map((option) => (
                <Button
                  variant={
                    slippageOption === option.value
                      ? ButtonVariant.DEFAULT
                      : ButtonVariant.BADGE
                  }
                  key={option.value}
                  className="px-0"
                  onClick={() => setSlippageOption(option.value)}
                >
                  {option.icon || option.label}
                </Button>
              ))}
            </div>
            <Card className="flex justify-between items-center px-2">
              <Input
                type="text"
                placeholder="Custom"
                className="h-[36px] w-full bg-transparent border-none text-primary/80"
                onChange={(e) => handleDynamicSlippage(e)}
                value={isNaN(Number(slippageOption)) ? '' : `${slippageOption}`}
              />
              <span className="text-primary/80">%</span>
            </Card>
          </div>
        )}
      </div>

      {/* Swift */}
      <div className="flex items-center space-x-2">
        <span>SWIFT</span>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setSwift(false)}
            className={cn('text-sm', {
              'text-muted-foreground': swift,
            })}
            isInvisible
          ></Button>
          <Switch checked={swift} onCheckedChange={setSwift} />
          <Button
            onClick={() => setSwift(true)}
            className={cn('text-sm', {
              'text-muted-foreground': !swift,
            })}
            isInvisible
          ></Button>
        </div>
      </div>

      {error && (
        <p className="w-full flex justify-start items-center space-x-2 text-red-500">
          <CircleAlert />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
