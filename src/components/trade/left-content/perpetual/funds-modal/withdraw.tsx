'use client'

import { useWithdraw } from '@/components/trade/hooks/drift/use-withdraw'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/components/ui'
import { BN, convertToNumber, SpotMarkets } from '@drift-labs/sdk-browser'
import { useEffect, useMemo, useState } from 'react'
import Confirm from './confirm'

interface WithDrawProps {
  accountIds: number[]
  open: boolean
  validateAmount: (value: string, decimals: number) => boolean
}

const percentageButtons = [
  { label: '50%', value: 50 },
  { label: 'max', value: 100 },
]

export default function WithDraw({
  accountIds,
  open,
  validateAmount,
}: WithDrawProps) {
  // state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [tokenSymbol, setTokenSymbol] = useState<string>('SOL')
  const tokenSpotMarketInfo = useMemo(() => {
    const depositTokenSportMarketInfo = SpotMarkets['mainnet-beta'].find(
      (market) => market.symbol === tokenSymbol
    )

    return {
      mint: depositTokenSportMarketInfo?.mint.toBase58(),
      decimals: Number(depositTokenSportMarketInfo?.precisionExp),
    }
  }, [tokenSymbol])
  const {
    withdraw,
    loading,
    withdrawalLimit,
    withdrawalLimitLoading,
    precision,
  } = useWithdraw({ subAccountId: 0, tokenSymbol: tokenSymbol })

  // handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      if (validateAmount(val, tokenSpotMarketInfo.decimals)) {
        setWithdrawAmount(val)
      }
      const cursorPosition = e.target.selectionStart
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleInputAmountByPercentage = (percent: number) => {
    try {
      const amount = withdrawalLimit.div(new BN(100 / percent))
      const numbericAmount = convertToNumber(amount, precision)
      setWithdrawAmount(numbericAmount.toString())
    } catch (err) {
      console.error('Error calculating amount:', err)
    }
  }

  useEffect(() => {
    if (!open) {
      setWithdrawAmount('')
    }
  }, [open])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p>Transfer type and Amount</p>
        <div className="flex items-center space-x-2">
          <div className="w-[100px]">
            <Select
              value={tokenSymbol}
              onValueChange={(value) => {
                setWithdrawAmount('')
                setTokenSymbol(value)
              }}
            >
              <SelectTrigger className="bg-transparent text-primary h-12 rounded-input">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent className="border border-primary text-primary">
                {SpotMarkets['mainnet-beta'].map((market, index) => (
                  <SelectItem value={market.symbol} key={index}>
                    {market.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="0.00"
            className="text-primary text-xl bg-transparent placeholder:text-primary"
            type="text"
            onChange={(e) => handleAmountChange(e)}
            value={withdrawAmount}
          />
        </div>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <span>Available to withdraw</span>
          <p>
            {withdrawalLimitLoading ? (
              <Spinner size={16} />
            ) : (
              `${convertToNumber(withdrawalLimit, precision)}`
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {percentageButtons.map(({ label, value }) => (
            <Button
              key={value}
              variant={ButtonVariant.BADGE}
              size={ButtonSize.SM}
              onClick={() => handleInputAmountByPercentage(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent>
          <span className="text-sm">
            The available amount to withdraw may be less than your balance due
            to open positions, orders, borrows, and/or daily withdrawal limits
            being reached.
          </span>
        </CardContent>
      </Card>

      <Confirm
        accountIds={accountIds}
        amount={withdrawAmount}
        handleConfirm={() => withdraw(withdrawAmount)}
        isChecked={true}
        loading={loading}
      />
    </div>
  )
}
