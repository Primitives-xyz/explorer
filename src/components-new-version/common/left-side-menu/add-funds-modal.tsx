'use client'

import { cn, formatRawAmount } from '@/components-new-version/utils/utils'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTokenBalance } from '@/hooks/use-token-balance'
import { CircleAlert, Loader2, X } from 'lucide-react'
import { useState } from 'react'
// import { useCurrentWallet } from "@/components/auth/hooks/use-current-wallet"
import { useTokenInfo } from '@/hooks/use-token-info'
// import { formatRawAmount } from "@/utils/format"
// import { useWallet } from "@/components/auth/wallet-context"
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

interface AddFundsModalProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

interface InputError {
  title: string
  content: string
}

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
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const [collateralSource, setCollateralSource] = useState<string>('wallet')
  const [selectedTab, setSelectedTab] = useState<string>('wallet')
  const [selectedDepositToken, setSelectedDepositeToken] = useState<string>(
    'So11111111111111111111111111111111111111112'
  )
  const { symbol, decimals, image } = useTokenInfo(selectedDepositToken)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [isChecked, setIsChecked] = useState(false)
  const { balance, rawBalance, loading } = useTokenBalance(
    walletAddress,
    selectedDepositToken
  )
  const [depositeAmount, setDepositeAmount] = useState<string>('')
  const [inputError, setInputError] = useState<InputError | null>(null)

  const validateAmount = (value: string): boolean => {
    if (value === '') return true

    // Check if the value is a valid number
    const numericValue = Number(value)
    if (isNaN(numericValue)) {
      return false
    }

    // Check if the value is positive
    if (numericValue <= 0) {
      return false
    }

    // Check if the value has too many decimal places
    const decimalParts = value.split('.')
    if (
      decimalParts.length > 1 &&
      decimalParts[1]?.length &&
      decimalParts[1]?.length > decimals!
    ) {
      return false
    }

    return true
  }

  const handleHalfAmount = () => {
    if (!balance || typeof rawBalance !== 'bigint' || !decimals) return

    try {
      const halfAmount = rawBalance / 2n
      const formattedHalf = formatRawAmount(halfAmount, BigInt(decimals))

      if (validateAmount(formattedHalf)) setDepositeAmount(formattedHalf)
      setInputError(null)
    } catch (err) {
      console.error('Error calculating half amount:', err)
    }
  }

  const handleMaxAmount = () => {
    if (!balance || typeof rawBalance !== 'bigint' || !decimals) return

    try {
      const formattedMax = formatRawAmount(rawBalance, BigInt(decimals))

      if (validateAmount(formattedMax)) setDepositeAmount(formattedMax)
      setInputError(null)
    } catch (err) {
      console.error('Error calculating max amount:', err)
    }
  }

  const initAndDeposite = async () => {
    try {
      const res = await fetch('api/drift/initialize-drift', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: JSON.stringify({
          walletAddy: walletAddress,
          depositeTokenMint: selectedDepositToken,
        }),
      })

      const data = await res.json()

      console.log('data:', data.initOrderAndDepositeCollateralTx)
    } catch (error) {
      console.log('Error in fetching init and deposite collateral tx:', error)
    }
  }

  return (
    <div>
      <div
        className={cn(
          'fixed inset-0 z-50 flex justify-start bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false)
        }}
      >
        <div
          className={cn(
            'w-full max-w-md bg-gray-950 text-gray-300 shadow-xl transition-transform duration-300 ease-in-out',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between border-b border-gray-800 p-4">
            <h2 className="text-2xl font-bold text-white">Add funds</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="p-4 space-y-6">
            {/* Deposit Collateral From */}
            <div className="space-y-2">
              <p className="text-gray-400">Deposit Collateral From</p>
              <Tabs defaultValue="wallet" onValueChange={setSelectedTab}>
                <div className="flex justify-end">
                  <TabsList className="bg-[#1a1f2a]">
                    <TabsTrigger
                      value="wallet"
                      className={`px-4 py-1.5 ${
                        selectedTab === 'wallet'
                          ? 'bg-[#3a4252] text-white'
                          : 'text-gray-400'
                      }`}
                    >
                      Wallet
                    </TabsTrigger>
                    <TabsTrigger
                      value="account"
                      className={`px-4 py-1.5 ${
                        selectedTab === 'account'
                          ? 'bg-[#3a4252] text-white'
                          : 'text-gray-400'
                      }`}
                    >
                      Account
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="account">
                  {/* Funding Account (only in second image) */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-400">Funding Account</p>
                    <div className="relative">
                      <select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        className="w-full bg-[#1a1f2a] border border-gray-700 text-white rounded-md h-10 px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" disabled>
                          Select account
                        </option>
                        <option value="main">Main Account</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {collateralSource == 'account' && <div></div>}

            {/* Transfer type and Amount */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Transfer type and Amount</p>
              <div className="flex gap-2">
                <div className="relative w-24">
                  <select
                    value={selectedDepositToken}
                    onChange={(e) => setSelectedDepositeToken(e.target.value)}
                    className="w-full bg-[#1a1f2a] border border-gray-700 text-white rounded-md h-10 px-9 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sol">SOL</option>
                    <option value="usdc">USDC</option>
                  </select>
                </div>
                <input
                  inputMode="decimal"
                  placeholder="0.00"
                  className="flex-1 bg-[#1a1f2a] border-gray-700 text-white outline-none text-right px-2"
                  type="text"
                  onChange={(e) => {
                    const val = e.target.value
                    if (
                      val === '' ||
                      val === '.' ||
                      /^[0]?\.[0-9]*$/.test(val) ||
                      /^[0-9]*\.?[0-9]*$/.test(val)
                    ) {
                      const cursorPosition = e.target.selectionStart
                      setDepositeAmount(val)
                      if (Number.parseFloat(balance) < Number.parseFloat(val)) {
                        setInputError({
                          title: 'Invalid deposit amount',
                          content:
                            "You can't deposit more than your available account balance",
                        })
                      } else {
                        setInputError(null)
                      }
                      window.setTimeout(() => {
                        e.target.focus()
                        e.target.setSelectionRange(
                          cursorPosition,
                          cursorPosition
                        )
                      }, 0)
                    }
                  }}
                  value={depositeAmount}
                />
              </div>
            </div>
            {/* Available balance */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400">Available balance</p>
              <div className="flex items-center gap-4">
                {loading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <span>{balance}</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md bg-gray-800 hover:bg-gray-700"
                  onClick={handleHalfAmount}
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md bg-gray-800 hover:bg-gray-700"
                  onClick={handleMaxAmount}
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Error message */}
            {inputError && (
              <div className="bg-[#1a1f2a] border-l-4 border-red-500 p-3">
                <p className="text-red-500 font-medium">{inputError.title}</p>
                <p className="text-sm text-gray-300">{inputError.content}</p>
              </div>
            )}

            <p className="text-gray-400">Depositing funds from wallet</p>

            {/* Account creation notice */}
            <div className="rounded-md border border-gray-800 bg-gray-900 p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-900/30 text-yellow-500">
                  <CircleAlert className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-yellow-500">
                    Creating an account costs 0.0314 SOL
                  </p>
                </div>
                <div className="ml-auto">
                  <CircleAlert className="h-5 w-5 text-gray-600" />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1 border-gray-600"
                />
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I understand that dynamic fees are in place as a safe guard
                  and that rent can be reclaimed upon account deletion, other
                  than the 0.0001 SOL New Account Fee.
                </label>
              </div>
            </div>

            {/* Asset Balance */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400">Asset Balance</p>
              <span>
                {decimals && depositeAmount.length
                  ? formatRawAmount(
                      BigInt(
                        Math.ceil(
                          (Number.parseFloat(balance) -
                            Number.parseFloat(depositeAmount)) *
                            Math.pow(10, decimals)
                        )
                      ),
                      BigInt(decimals)
                    )
                  : '0'}
              </span>
            </div>

            {/* Add button */}
            <button
              className={cn(
                'w-full py-2 text-[16px] rounded-[20px] font-bold',
                !isChecked && 'bg-gray-700 cursor-not-allowed',
                isChecked &&
                  'bg-[#97EF83] hover:bg-[#64e947] text-[#292C31]  cursor-pointer'
              )}
              onClick={initAndDeposite}
              // disabled={!isChecked || !depositeAmount || !(inputError === null)}
            >
              ADD
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
