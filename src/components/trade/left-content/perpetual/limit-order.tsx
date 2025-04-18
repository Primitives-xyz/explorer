import { UserStats } from "@/components/tapestry/models/drift.model";
import { Button, Card, Input, Switch } from "@/components/ui";
import { cn } from "@/utils/utils";
import Image from "next/image";
import LeverageSelector from "./leverage-selector";

interface LimitOrderProps {
  limitPrice: number
  handleLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  amount: string
  marketPrice: number
  leverageValue: number
  handleLeverageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  selectedLeverageSizeUsd: string
  selectedLeverageSizeToken: string
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setAmount: (amount: string) => void
  userStats: UserStats
  swift: boolean
  setSwift: (swift: boolean) => void
  setLeverageValue: (leverage: number) => void  
  setIsSizeByLeverage: (value: boolean) => void
  isSizeByLeverage: boolean
}

export default function LimitOrder({
  limitPrice,
  handleLimitPriceChange,
  amount,
  marketPrice,
  leverageValue,
  selectedLeverageSizeUsd,
  selectedLeverageSizeToken,
  handleAmountChange,
  setAmount,
  userStats,
  swift,
  setSwift,
  setLeverageValue,
  setIsSizeByLeverage,
  isSizeByLeverage
}: LimitOrderProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span>Limit Price</span>
        <Card className="flex items-center">
          <Input
            placeholder="0.00"
            className="text-primary text-xl bg-transparent placeholder:text-primary border-none"
            value={limitPrice}
            type='number'
            onChange={(e) => handleLimitPriceChange(e)}
          />
          <span className="px-2">USD</span>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Card className="flex items-center">
          <Input
            placeholder="0.00"
            className="text-primary text-xl bg-transparent border-none placeholder:text-primary"
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
            className="rounded-full mx-1"
          />
        </Card>
        <Card className="flex items-center">
          <Input
            placeholder="0.00"
            value={isSizeByLeverage ? selectedLeverageSizeUsd : (Number(amount) * marketPrice).toFixed(2)}
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
          min={0}
          max={Math.min(userStats.maxLeverage, 20)}
          setAmount={setAmount}
          leverageValue={leverageValue}
          setLeverageValue={setLeverageValue}
          setIsSizeByLeverage={setIsSizeByLeverage}
        />
      </div>

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
    </div>
  )
}