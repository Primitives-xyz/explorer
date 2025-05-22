import {
  DirectionFilterType,
  IUserStats,
  MarketOrderParams,
  OrderType,
} from '@/components/tapestry/models/drift.model'
import { useLeverageSize } from '@/components/trade/hooks/drift/use-leverage-size'
import { useLiquidationPrice } from '@/components/trade/hooks/drift/use-liquidation-price'
import { Input, Separator, Spinner } from '@/components/ui'
import { SOL_MINT } from '@/utils/constants'
import { formatUsdValue } from '@/utils/utils'
import LeverageSelector from '@components/trade/left-content/perpetual/leverage-selector'
import { Slippage } from '@components/trade/left-content/perpetual/slippage'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

const SOL_IMG_URI = `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${SOL_MINT}/logo.png`
const USDC_IMG_URI =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'

interface Props {
  symbol: string
  priceLoading: boolean
  marketPrice: number
  userStats: IUserStats
  direction: DirectionFilterType
  setOrderParams: (params: MarketOrderParams) => void
}

export default function MarketOrder({
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

  const getMaxTradeAmount = useMemo(() => {
    if (!userStats || userStats.maxTradeSize <= 0) return '0.00'

    return userStats.maxTradeSize.toFixed(2)
  }, [userStats])
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
      orderType: OrderType.MARKET,
      amount: orderAmount,
      slippage: slippageOption,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderAmount, slippageOption])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p>Size</p>
        <div className="flex items-center gap-2">
          <p>Max: {getMaxTradeAmount} USDC</p>
          {priceLoading && <Spinner size={12} />}
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
