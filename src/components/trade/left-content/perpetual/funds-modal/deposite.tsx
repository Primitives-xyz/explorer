import { useTokenBalance } from "@/components/trade/hooks/use-token-balance"
import { Button, ButtonSize, ButtonVariant, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { useCurrentWallet } from "@/utils/use-current-wallet"
import { formatRawAmount } from "@/utils/utils"
import { SpotMarkets } from "@drift-labs/sdk-browser"
import { useEffect, useMemo, useState } from "react"
import Confirm from "./confirm"
import { useDeposit } from "@/components/trade/hooks/drift/use-deposit"

interface DepositeProps {
  userAccountsLoading: boolean
  accountIds: number[]
  open: boolean
  validateAmount: (value: string, decimals: number) => boolean
  refreshGetUserAccountIds: () => void
  setIsOpen: (value: boolean) => void
}

const percentageButtons = [
  { label: '50%', value: 50 },
  { label: 'max', value: 100 },
]

export default function Deposite({
  accountIds,
  open,
  userAccountsLoading,
  refreshGetUserAccountIds,
  validateAmount,
  setIsOpen
}: DepositeProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [depositTokenSymbol, setDepositTokenSymbol] = useState<string>('SOL')
  const [depositAmount, setDepositAmount] = useState<string>('')
  const { walletAddress } = useCurrentWallet()
  const depositTokenSpotMarketInfo = useMemo(() => {
    const depositTokenSportMarketInfo = SpotMarkets['mainnet-beta'].find(
      (market) => market.symbol === depositTokenSymbol
    )

    return {
      mint: depositTokenSportMarketInfo?.mint.toBase58(),
      decimals: Number(depositTokenSportMarketInfo?.precisionExp),
    }
  }, [depositTokenSymbol])
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

  const {
    depositCollateral,
    loading: depositCollateralLoading,
  } = useDeposit({
    amount: depositAmount,
    depositToken: depositTokenSpotMarketInfo.mint ?? '',
    depositTokenSymbol: depositTokenSymbol,
    depositTokenDecimals: depositTokenSpotMarketInfo.decimals,
    subAccountId: selectedAccountId === '' ? null : Number(selectedAccountId),
  })

  const deposit = async () => {
    await depositCollateral()
    setIsOpen(false)
    refreshGetUserAccountIds()
  }

  useEffect(() => {
    if (!open) {
      setDepositAmount("")
    }
  }, [open])

  return (
    <>
      <div className="space-y-2">
        <p>Deposit to</p>
        <Select
          value={selectedAccountId}
          onValueChange={(value) => setSelectedAccountId(value)}
        >
          <SelectTrigger className="bg-transparent text-primary h-12 rounded-input">
            <SelectValue
              placeholder={`${userAccountsLoading
                ? 'Loading Accounts...'
                : 'Select Accounts'
                }`}
            />
          </SelectTrigger>
          {!userAccountsLoading && (
            <SelectContent className="border border-primary text-primary">
              {accountIds.map((id) => (
                <SelectItem value={id.toString()} key={id}>
                  {id === 0 ? 'Main Account' : `SubAccount ${id}`}
                </SelectItem>
              ))}
            </SelectContent>
          )}
        </Select>
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
                {
                  SpotMarkets['mainnet-beta'].map((market, index) => (
                    <SelectItem value={market.symbol} key={index}>
                      {market.symbol}
                    </SelectItem>
                  ))
                }
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

      <Confirm
        accountIds={accountIds}
        amount={depositAmount}
        handleConfirm={deposit}
        isChecked={true}
        loading={depositCollateralLoading}
      />
    </>
  )
}