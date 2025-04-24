'use client'

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
  Spinner,
} from '@/components/ui'
import { CheckboxSize } from '@/components/ui/switch/checkbox.models'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn, formatRawAmount } from '@/utils/utils'
import { SpotMarketConfig, SpotMarkets } from '@drift-labs/sdk-browser'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { CircleAlert, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDeposit } from '../../hooks/drift/use-deposit'
import { useDriftUsers } from '../../hooks/drift/use-drift-users'
import { useTokenBalance } from '../../hooks/use-token-balance'

interface AddFundsModalProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

interface InputError {
  title: string
  content: string
}

const percentageButtons = [
  { label: '50%', value: 50 },
  { label: 'max', value: 100 },
]

const env = 'mainnet-beta'

export const getTokenAddress = (
  mintAddress: string,
  userPubKey: string
): Promise<PublicKey> => {
  return getAssociatedTokenAddress(
    new PublicKey(mintAddress),
    new PublicKey(userPubKey)
  )
}

export default function AddFundsModal({
  isOpen,
  setIsOpen,
}: AddFundsModalProps) {
  const { walletAddress } = useCurrentWallet()
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [inputError, setInputError] = useState<InputError | null>(null)
  const [depositTokenSymbol, setDepositTokenSymbol] = useState<string>('SOL')
  const [sportMarketInfo, setSportMarketInfo] = useState<SpotMarketConfig[]>(
    SpotMarkets[env]
  )
  const { accountIds, loading: userAccountsLoading, refreshGetUserAccountIds } = useDriftUsers()

  const depositTokenSpotMarketInfo = useMemo(() => {
    const depositTokenSportMarketInfo = sportMarketInfo?.find(
      (market) => market.symbol === depositTokenSymbol
    )

    return {
      mint: depositTokenSportMarketInfo?.mint.toBase58(),
      decimals: Number(depositTokenSportMarketInfo?.precisionExp),
    }
  }, [depositTokenSymbol, sportMarketInfo])

  const { balance, rawBalance, loading } = useTokenBalance(
    walletAddress,
    depositTokenSpotMarketInfo.mint ?? ''
  )

  const {
    depositCollateral,
    loading: depositCollateralLoading,
    error: depositCollateralError,
  } = useDeposit({
    amount: depositAmount,
    depositToken: depositTokenSpotMarketInfo.mint ?? '',
    depositTokenSymbol: depositTokenSymbol,
    depositTokenDecimals: depositTokenSpotMarketInfo.decimals,
    subAccountId: selectedAccount === '' ? null : Number(selectedAccount),
  })

  const validateAmount = (value: string, decimals: number = 6): boolean => {
    const numericValue = Number(value)

    if (value === '') return true
    if (isNaN(numericValue)) return false
    if (numericValue < 0) return false

    const decimalParts = value.split('.')

    if (
      decimalParts.length > 1 &&
      decimalParts[1]?.length &&
      decimalParts[1]?.length > decimals
    ) {
      return false
    }

    return true
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

  const initAndDeposit = async () => {
    await depositCollateral()
    setIsOpen(false)
    setIsChecked(false)
    setDepositAmount("")
    refreshGetUserAccountIds()
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-start bg-black/50 transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false)
          setIsChecked(false)
          setDepositAmount('')
          setSelectedAccount('')
          setDepositTokenSymbol('SOL')
        }
      }}
    >
      <div
        className={cn(
          'w-full max-w-md bg-gray-950 text-gray-300 shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-800 p-4 mt-topbar">
          <h2 className="text-2xl font-bold text-white">Add funds</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false)
              setIsChecked(false)
              setDepositAmount('')
              setSelectedAccount('')
              setDepositTokenSymbol('SOL')
            }}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {!accountIds.length ? (
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
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-400">Deposit to</p>
              <Select
                value={selectedAccount}
                onValueChange={(value) => setSelectedAccount(value)}
              >
                <SelectTrigger className="bg-transparent text-primary h-12 rounded-input">
                  <SelectValue
                    placeholder={`${
                      userAccountsLoading
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
          )}

          <div className="space-y-2">
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
                    {sportMarketInfo &&
                      sportMarketInfo.map((market, index) => (
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

          {/* Error message */}
          {inputError && (
            <div className="bg-[#1a1f2a] border-l-4 border-red-500 p-3">
              <p className="text-red-500 font-medium">{inputError.title}</p>
              <p className="text-sm text-gray-300">{inputError.content}</p>
            </div>
          )}

          {!accountIds.length && (
            <>
              <p className="text-gray-400">Depositing funds from wallet</p>

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
                        onChange={() => {}}
                        // className="pointer-events-none"
                        size={CheckboxSize.DEFAULT}
                      />
                      <span className="text-sm">
                        I understand that dynamic fees are in place as a safe
                        guard and that rent can be reclaimed upon account
                        deletion, other than the 0.0001 SOL New Account Fee.
                      </span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!accountIds.length ? (
            <Button
              variant={
                isChecked && Number(depositAmount) > 0
                  ? ButtonVariant.DEFAULT
                  : ButtonVariant.OUTLINE_WHITE
              }
              className="w-full"
              onClick={initAndDeposit}
              disabled={
                !isChecked ||
                depositCollateralLoading ||
                Number(depositAmount) === 0
              }
            >
              {depositCollateralLoading ? <Spinner /> : 'ADD'}
            </Button>
          ) : (
            <Button
              variant={
                Number(depositAmount) > 0
                  ? ButtonVariant.DEFAULT
                  : ButtonVariant.OUTLINE_WHITE
              }
              className="w-full"
              onClick={initAndDeposit}
              disabled={Number(depositAmount) === 0 || depositCollateralLoading}
            >
              {depositCollateralLoading ? <Spinner /> : 'ADD'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
