import {
  DirectionFilterType,
  IUserStats,
  LimitOrderParams,
  OrderType,
} from '@/components/tapestry/models/drift.model'
import { useLeverageSize } from '@/components/trade/hooks/drift/use-leverage-size'
import { useLiquidationPrice } from '@/components/trade/hooks/drift/use-liquidation-price'
import { Input, Separator, Spinner, Switch } from '@/components/ui'
import { formatUsdValue } from '@/utils/utils'
import LeverageSelector from '@components/trade/left-content/perpetual/leverage-selector'
import { Slippage } from '@components/trade/left-content/perpetual/slippage'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const SOL_IMG_URI =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
const USDC_IMG_URI =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'

interface Props {
  symbol: string
  priceLoading: boolean
  marketPrice: number
  userStats: IUserStats
  direction: DirectionFilterType
  setOrderParams: (params: LimitOrderParams) => void
}

export default function LimitOrder({
  symbol,
  direction,
  priceLoading,
  marketPrice,
  userStats,
  setOrderParams,
}: Props) {
  // States
  const [amount, setAmount] = useState<string>('')
  const [isSizeByLeverage, setIsSizeByLeverage] = useState<boolean>(false)
  const [leverageValue, setLeverageValue] = useState<number>(1)
  const [slippageOption, setSlippageOption] = useState<string>('0.1')
  const [slippageExpanded, setSlippageExpanded] = useState<boolean>(false)
  const [orderAmount, setOrderAmount] = useState<string>('')
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [reduceOnly, setReduceOnly] = useState<boolean>(false)

  const { selectedLeverageSizeUsd, selectedLeverageSizeToken } =
    useLeverageSize({
      userStats,
      symbol,
      leverageValue,
      marketPrice: marketPrice,
    })

  const { liquidationPrice, loading: liqPriceLoading } = useLiquidationPrice({
    symbol,
    amount: orderAmount,
    direction: direction === DirectionFilterType.LONG ? 'long' : 'short',
  })
  // handlers
  const handleMarketOrderMarginChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value

    setIsSizeByLeverage(false)

    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const maxAmount = userStats?.maxTradeSize || 0
      const totalAmountInUSD = Number(val) * marketPrice
      const newVal =
        totalAmountInUSD > maxAmount
          ? (maxAmount / marketPrice).toFixed(2)
          : val

      setAmount(newVal)

      const cursorPosition = e.target.selectionStart
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      setLimitPrice(val)

      const cursorPosition = e.target.selectionStart
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleDynamicSlippage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const cursor = e.target.selectionStart || 0

    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      setSlippageOption(Number(val) < 100 ? val : '99')

      const cursorPosition = e.target.selectionStart
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const formatLeverage = (leverage: number) => {
    return leverage.toFixed(2) + 'x'
  }

  useEffect(() => {
    if (!isSizeByLeverage) {
      const newLeverageSize =
        ((Number(amount) * marketPrice) / userStats.maxTradeSize) *
        userStats.maxLeverage
      setLeverageValue(newLeverageSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, userStats, marketPrice])

  useEffect(() => {
    if (isSizeByLeverage) {
      setOrderAmount(selectedLeverageSizeToken)
    } else {
      setOrderAmount(amount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, selectedLeverageSizeToken])

  useEffect(() => {
    setOrderParams({
      orderType: OrderType.LIMIT,
      amount: orderAmount,
      slippage: slippageOption,
      limitPrice,
      reduceOnly,
    } as LimitOrderParams)
  }, [orderAmount, slippageOption, limitPrice, reduceOnly])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span>Market Price</span>
        <div className="flex items-center gap-2">
          <p className="text-primary">{marketPrice.toFixed(4)} USD</p>
          {priceLoading && <Spinner size={12} />}
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
            onChange={(e) => handleMarketOrderMarginChange(e)}
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

      {userStats.maxLeverage ? (
        <LeverageSelector
          min={0}
          max={Math.min(userStats.maxLeverage, 20)}
          setAmount={setAmount}
          leverageValue={leverageValue}
          setLeverageValue={setLeverageValue}
          setIsSizeByLeverage={setIsSizeByLeverage}
        />
      ) : (
        <></>
      )}

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

      <Separator />

      <div className="flex justify-between items-center text-sm">
        <p>Est.Liquidation Price</p>
        <div className="flex items-center gap-2">
          {liqPriceLoading ? (
            <Spinner size={16} />
          ) : liquidationPrice ? (
            formatUsdValue(liquidationPrice)
          ) : (
            'None'
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <p>Acct. Leverage</p>
        <p className="flex items-center gap-2">
          {formatLeverage(userStats.leverage)} <ArrowRight size={14} />
          {formatLeverage(
            userStats.leverage + (Number(amount) > 0 ? leverageValue : 0)
          )}
        </p>
      </div>
    </div>
  )
}
