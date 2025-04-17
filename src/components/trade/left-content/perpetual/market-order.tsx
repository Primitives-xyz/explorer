import Image from "next/image";
import { ChevronDown, ChevronUp, CircleAlert, Infinity, Zap } from "lucide-react";
import { cn } from "@/utils/utils";
import { Button, ButtonVariant, Card, Input, Spinner, Switch } from "@/components/ui";
import { UserStats } from "@/components/tapestry/models/drift.model";
import LeverageSelector from "./leverage-selector";

interface MarketOrderProps {
  getMaxTradeAmount: () => string
  priceLoading: boolean
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  amount: string
  marketPrice: number
  leverageValue: number
  handleLeverageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setLeverageValue: (value: number) => void
  slippageExpanded: boolean
  setSlippageExpanded: (value: boolean) => void
  slippageOption: string
  setSlippageOption: (value: string) => void
  handleDynamicSlippage: (e: React.ChangeEvent<HTMLInputElement>) => void
  swift: boolean
  setSwift: (value: boolean) => void
  userStats: UserStats
  setAmount: (value: string) => void
  getSizeByLeveragePercent: (leverage: number) => string
  error: string | null
}

const slippageOptions = [
  { value: '0.1', label: '0.1%' },
  { value: '0.5', label: '0.5%' },
  { value: '1', label: '1%' },
  { value: 'zap', icon: <Zap size={16} /> },
  { value: 'infinity', icon: <Infinity size={16} /> },
]

export default function MarketOrder({
  getMaxTradeAmount,
  priceLoading,
  handleAmountChange,
  amount,
  marketPrice,
  leverageValue,
  setLeverageValue,
  slippageExpanded,
  setSlippageExpanded,
  slippageOption,
  setSlippageOption,
  handleDynamicSlippage,
  swift,
  setSwift,
  userStats,
  setAmount,
  getSizeByLeveragePercent,
  error
}: MarketOrderProps) {
  return (
    <div className="space-y-6">
      {/* Size */}
      <div className="flex justify-between items-center">
        <span>Size</span>
        <Button className="flex space-x-2 items-center">
          <span>Max: {getMaxTradeAmount()} SOL</span>
          {priceLoading && <Spinner size={12} />}
        </Button>
      </div>

      {/* Market */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="flex items-center">
          <Input
            placeholder="0.00"
            className="text-primary text-xl bg-transparent border-none placeholder:text-primary"
            type="text"
            onChange={(e) => handleAmountChange(e)}
            value={amount}
          />
          <Image
            src={
              'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
            }
            alt="USDC"
            width={30}
            height={30}
            className="rounded-full mx-1"
          />
        </Card>
        <Card className="flex items-center">
          <Input
            placeholder="0.00"
            value={
              marketPrice && amount
                ? (Number(amount) * marketPrice).toFixed(2)
                : ''
            }
            className="text-primary text-xl bg-transparent placeholder:text-primary border-none"
            disabled={true}
          />
          <Image
            src={
              'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
            }
            alt="USDC"
            width={30}
            height={30}
            className="rounded-full mx-1"
          />
        </Card>
      </div>

      {/* Leverage */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Leverage</span>
          <span className="font-semibold">
            {leverageValue.toFixed(2)}x
          </span>
        </div>

        <LeverageSelector
          min={1}
          max={Math.min(userStats.maxLeverage, 20)}
          setAmount={setAmount}
          getSizeByLeveragePercent={getSizeByLeveragePercent}
          leverageValue={leverageValue}
          setLeverageValue={setLeverageValue}
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
                value={
                  isNaN(Number(slippageOption))
                    ? ''
                    : `${slippageOption}`
                }
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