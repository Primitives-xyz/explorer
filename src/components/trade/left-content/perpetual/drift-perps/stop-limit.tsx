import {
  DirectionFilterType,
  IUserStats,
  OrderType,
  StopLimitOrderParams,
} from '@/components/tapestry/models/drift.model'
import { useOraclePrice } from '@/components/trade/hooks/drift/use-oracle-price'
import { Card, CardContent, Input, Spinner, Switch } from '@/components/ui'
import { SOL_MINT } from '@/utils/constants'
import { CircleAlert } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

const SOL_IMG_URI = `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${SOL_MINT}/logo.png`
const USDC_IMG_URI =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'

interface Props {
  marketPrice: number
  priceLoading: boolean
  direction: DirectionFilterType
  userStats: IUserStats
  setOrderParams: (params: StopLimitOrderParams) => void
  setIsError: (val: boolean) => void
}

export default function StopLimit({
  marketPrice,
  priceLoading,
  direction,
  userStats,
  setOrderParams,
  setIsError,
}: Props) {
  // States
  const [orderAmount, setOrderAmount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [symbol, setSymbol] = useState<string>('SOL')
  const { oraclePrice, loading } = useOraclePrice({ symbol })
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [triggerOraclePrice, setTriggerOraclePrice] = useState<string>('')
  const getMaxTradeAmount = useMemo(() => {
    if (!userStats || userStats.maxTradeSize <= 0) return '0.00'

    return userStats.maxTradeSize.toFixed(2)
  }, [userStats])
  const [reduceOnly, setReduceOnly] = useState<boolean>(false)

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

  useEffect(() => {
    setOrderParams({
      orderType: OrderType.SL,
      amount: orderAmount,
      triggerPrice: triggerOraclePrice,
      limitPrice,
      reduceOnly,
    } as StopLimitOrderParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderAmount, triggerOraclePrice, reduceOnly])

  useEffect(() => {
    if (error) {
      setIsError(true)
    }

    if (!error) {
      setIsError(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  useEffect(() => {
    setTriggerOraclePrice(oraclePrice.toString())
  }, [oraclePrice])

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <p>Trigger Oracle Price</p>
          {loading && <Spinner size={12} />}
        </div>
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

      <div>
        <p>Limit Price</p>
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

      <div className="flex items-center space-x-2">
        <p>Reduce Only</p>
        <Switch checked={reduceOnly} onCheckedChange={setReduceOnly} />
      </div>

      {error && (
        <Card>
          <CardContent className="flex items-center gap-4 p-3">
            <CircleAlert className="text-red-500" size={40} />
            <p className="text-red-500 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
