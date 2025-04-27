'use client'

import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { cn } from '@/utils/utils'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useDriftUsers } from '../../hooks/drift/use-drift-users'
import Deposite from './funds-modal/deposite'
import WithDraw from './funds-modal/withdraw'
import InitAndDeposite from './funds-modal/init-and-deposit'

interface AddFundsModalProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

interface InputError {
  title: string
  content: string
}

const getTokenAddress = (
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
  const [inputError, setInputError] = useState<InputError | null>(null)
  const { accountIds, loading: userAccountsLoading, refreshGetUserAccountIds } = useDriftUsers()

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

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-start bg-black/50 transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
    >
      <div
        className={cn(
          'w-full max-w-md bg-gray-950 text-gray-300 shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 mt-topbar">
          <h2 className="text-2xl font-bold text-white">
            {
              !accountIds.length ? 'Add funds' : 'Manage Balances'
            }
          </h2>
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
          {!accountIds.length ? (
            <InitAndDeposite
              validateAmount={validateAmount}
              refreshGetUserAccountIds={refreshGetUserAccountIds}
              open={isOpen}
              setIsOpen={setIsOpen}
            />
          ) : (
            <Tabs defaultValue="deposite">
              <TabsList className='w-full grid grid-cols-2'>
                <TabsTrigger value="deposite">Deposite</TabsTrigger>
                {/* <TabsTrigger value="withdraw">Withdraw</TabsTrigger> */}
              </TabsList>
              <TabsContent value="deposite" className='space-y-4'>
                <Deposite
                  accountIds={accountIds}
                  refreshGetUserAccountIds={refreshGetUserAccountIds}
                  open={isOpen}
                  setIsOpen={setIsOpen}
                  userAccountsLoading={userAccountsLoading}
                  validateAmount={validateAmount}
                />
              </TabsContent>
              {/* <TabsContent value="withdraw">
                <WithDraw
                  accountIds={accountIds}
                  validateAmount={validateAmount}
                />
              </TabsContent> */}
            </Tabs>
          )}

          {inputError && (
            <div className="bg-[#1a1f2a] border-l-4 border-red-500 p-3">
              <p className="text-red-500 font-medium">{inputError.title}</p>
              <p className="text-sm text-gray-300">{inputError.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
