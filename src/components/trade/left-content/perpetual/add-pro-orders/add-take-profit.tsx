import {
  AddTakeProfitOrderParams,
  OrderType,
} from '@/components/tapestry/models/drift.model'
import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import { useMarketPrice } from '@/components/trade/hooks/drift/use-market-price'
import { useOraclePrice } from '@/components/trade/hooks/drift/use-oracle-price'
import { useUserStats } from '@/components/trade/hooks/drift/use-user-stats'
import { CardContent, Input, Spinner } from '@/components/ui'
import { CircleAlert } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

const SOL_IMG_URI =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
const USDC_IMG_URI =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'

interface Props {
  symbol: string
  direction: string | null
  setOrderParams: (params: AddTakeProfitOrderParams) => void
  setIsError: (arg: boolean) => void
}

export default function AddTakeProfit({
  symbol,
  direction,
  setOrderParams,
  setIsError,
}: Props) {
  // States
  const { price: marketPrice, loading: priceLoading } = useMarketPrice({
    symbol,
  })
  const { accountIds } = useDriftUsers()
  const { userStats, loading: statsLoading } = useUserStats({
    subAccountId: accountIds[0] || 0,
    symbol,
  })
  const { oraclePrice, loading } = useOraclePrice({ symbol })
  const [orderAmount, setOrderAmount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [triggerOraclePrice, setTriggerOraclePrice] = useState<string>('')
  const getMaxTradeAmount = useMemo(() => {
    if (!userStats || userStats.maxTradeSize <= 0) return '0.00'

    return userStats.maxTradeSize.toFixed(2)
  }, [userStats])

  // handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const maxAmount = userStats?.maxTradeSize || 0
      const totalAmountInUSD = Number(val) * marketPrice

      if (totalAmountInUSD > maxAmount) {
        setError(
          `Order size must be less than or equal to ${(
            maxAmount / marketPrice
          ).toFixed(2)} SOL`
        )
      } else {
        setError(null)
      }

      setOrderAmount(val)

      const cursorPosition = e.target.selectionStart
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleTriggerOraclePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value

    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      setTriggerOraclePrice(val)

      const cursorPosition = e.target.selectionStart
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  useEffect(() => {
    if (Number(orderAmount) > 0.01) {
      setOrderParams({
        orderType: OrderType.ADD_TP,
        amount: orderAmount,
        symbol,
        currentPositionDirection: direction,
        triggerPrice: triggerOraclePrice,
      } as AddTakeProfitOrderParams)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderAmount, triggerOraclePrice, direction])

  useEffect(() => {
    setTriggerOraclePrice(oraclePrice.toString())
  }, [oraclePrice])

  useEffect(() => {
    if (error) {
      setIsError(true)
    }

    if (!error) {
      setIsError(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p>Trigger Oracle Price</p>
        {loading && <Spinner size={12} />}
      </div>
      <div>
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="0.00"
            className="pr-12 text-primary text-xl"
            value={triggerOraclePrice}
            onChange={(e) => handleTriggerOraclePriceChange(e)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full">
            USD
          </span>
        </div>
      </div>

      <div className="flex justify-end items-center">
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
            onChange={(e) => handleAmountChange(e)}
            value={orderAmount}
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
            value={(Number(orderAmount) * Number(triggerOraclePrice)).toFixed(
              2
            )}
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

      {error && (
        <CardContent className="flex items-center gap-4 p-1">
          <CircleAlert className="text-red-500" size={20} />
          <p className="text-red-500 font-medium">{error}</p>
        </CardContent>
      )}
    </div>
  )
}
