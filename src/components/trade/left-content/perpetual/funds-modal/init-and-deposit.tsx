'use client'

import { useDeposit } from '@/components/trade/hooks/drift/use-deposit'
import { useTokenBalance } from '@/components/trade/hooks/use-token-balance'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { CheckboxSize } from '@/components/ui/switch/checkbox.models'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { formatRawAmount } from '@/utils/utils'
import { SpotMarkets } from '@drift-labs/sdk-browser'
import { CircleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Confirm from './confirm'

interface InitAndDepositeProps {
  open: boolean
  validateAmount: (value: string, decimals: number) => boolean
  refreshGetUserAccountIds: () => void
  setIsOpen: (value: boolean) => void
}

const percentageButtons = [
  { label: '50%', value: 50 },
  { label: 'max', value: 100 },
]

export default function InitAndDeposite({
  open,
  validateAmount,
  refreshGetUserAccountIds,
  setIsOpen,
}: InitAndDepositeProps) {
  const { walletAddress } = useCurrentWallet()
  const [depositTokenSymbol, setDepositTokenSymbol] = useState<string>('SOL')
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const depositTokenSpotMarketInfo = useMemo(() => {
    const depositTokenSportMarketInfo = SpotMarkets['mainnet-beta'].find(
      (market) => market.symbol === depositTokenSymbol
    )

    return {
      mint: depositTokenSportMarketInfo?.mint.toBase58(),
      decimals: Number(depositTokenSportMarketInfo?.precisionExp),
    }
  }, [depositTokenSymbol])

  const { depositCollateral, loading: depositCollateralLoading } = useDeposit({
    amount: depositAmount,
    depositToken: depositTokenSpotMarketInfo.mint ?? '',
    depositTokenSymbol: depositTokenSymbol,
    depositTokenDecimals: depositTokenSpotMarketInfo.decimals,
    subAccountId: null,
  })

  const { balance, rawBalance, loading } = useTokenBalance(
    walletAddress,
    depositTokenSpotMarketInfo.mint ?? ''
  )

  // handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      if (validateAmount(val, depositTokenSpotMarketInfo.decimals)) {
        setDepositAmount(val)
      }
      const cursorPosition = e.target.selectionStart
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleInputAmountByPercentage = (percent: number) => {
    if (
      !balance ||
      typeof rawBalance !== 'bigint' ||
      !depositTokenSpotMarketInfo.decimals
    )
      return

    try {
      const quarterAmount = rawBalance / BigInt(100 / percent)
      const formattedQuarter = formatRawAmount(
        quarterAmount,
        BigInt(depositTokenSpotMarketInfo.decimals)
      )

      if (
        validateAmount(formattedQuarter, depositTokenSpotMarketInfo.decimals)
      ) {
        setDepositAmount(formattedQuarter)
      }
    } catch (err) {
      console.error('Error calculating amount:', err)
    }
  }

  const initAndDeposit = async () => {
    await depositCollateral()
    setIsOpen(false)
    refreshGetUserAccountIds()
  }

  useEffect(() => {
    if (!open) {
      setIsChecked(false)
      setDepositAmount('')
    }
  }, [open])

  return (
    <>
      <div className="flex justify-between items-center space-x-2">
        <p className="text-gray-400">Deposit Collateral From</p>

        <div className="bg-[#1a1f2a] rounded-button">
          <Button
            variant={ButtonVariant.GHOST}
            size={ButtonSize.DEFAULT}
            className="cursor-pointer bg-[#3a4252] text-white"
          >
            Wallet
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p>Transfer type and Amount</p>
        <div className="flex items-center space-x-2">
          <div className="w-[100px]">
            <Select
              value={depositTokenSymbol}
              onValueChange={(value) => {
                setDepositAmount('')
                setDepositTokenSymbol(value)
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
            value={depositAmount}
          />
        </div>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <span>Available Balance</span>
          <span>{balance}</span>
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
        <CardContent className="flex space-x-3">
          <div className="flex justify-center items-center">
            <div className="h-8 w-8 flex justify-center items-center rounded-full bg-yellow-900/30 ">
              <CircleAlert size={32} className="text-[#f2c94c]" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[#f2c94c]">
              <span>Creating an account costs 0.0314 SOL</span>
            </div>

            <label
              htmlFor="terms"
              className="flex items-center cursor-pointer space-x-3"
            >
              <Checkbox
                id="terms"
                checked={isChecked}
                onClick={() => {
                  setIsChecked(!isChecked)
                }}
                size={CheckboxSize.DEFAULT}
              />
              <span className="text-sm">
                I understand that dynamic fees are in place as a safe guard and
                that rent can be reclaimed upon account deletion, other than the
                0.0001 SOL New Account Fee.
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Confirm
        accountIds={[]}
        amount={depositAmount}
        handleConfirm={initAndDeposit}
        isChecked={isChecked}
        loading={depositCollateralLoading}
      />
    </>
  )
}
