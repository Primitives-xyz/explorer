import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import { Connection, VersionedTransaction } from '@solana/web3.js'
import { Loader2 } from 'lucide-react'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useStakeInfo } from '@/hooks/use-stake-info'
import { useToast } from '@/hooks/use-toast'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

export const UnstakeForm = () => {
  const t = useTranslations()
  const { toast } = useToast()
  const { isLoggedIn, sdkHasLoaded, walletAddress, primaryWallet } =
    useCurrentWallet()
  const [showUnstakeLoading, setShowUnstakeLoading] = useState<boolean>(false)
  const { refreshUserInfo } = useStakeInfo({})

  const LoadingDots = () => {
    return (
      <span className="inline-flex items-center">
        <span className="animate-pulse">.</span>
        <span className="animate-pulse animation-delay-200">.</span>
        <span className="animate-pulse animation-delay-400">.</span>
      </span>
    )
  }

  // Add handler for unstake
  const handleUnstake = async () => {
    try {
      setShowUnstakeLoading(true)
      const response = await fetch(`/api/unstake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddy: walletAddress,
        }),
      })
      const data = await response.json()
      const unStakeTx = data.unStakeTx
      const serializedBuffer: Buffer = Buffer.from(unStakeTx, 'base64')
      const vtx: VersionedTransaction = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )
      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
      const simulateTx = await connection.simulateTransaction(vtx)
      console.log('sim:', simulateTx)
      const txid = await signer.signAndSendTransaction(vtx)
      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      const tx = await connection.confirmTransaction({
        signature: txid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      confirmToast.dismiss()

      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t(
            'error.the_unstake_transaction_failed_please_try_again'
          ),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_unstake_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })

        // Refresh user info after successful unstake
        refreshUserInfo()
      }

      setShowUnstakeLoading(false)
    } catch (error) {
      console.log('Error in making stake tx:', error)
      setShowUnstakeLoading(false)
      toast({
        title: t('trade.transaction_failed'),
        description: t('error.the_unstake_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    }
  }

  return (
    <div className="mt-8">
      <div className="w-full my-3">
        {!sdkHasLoaded ? (
          <div className="bg-green-900/20 rounded-lg p-3 border border-green-400/20">
            <div className="flex items-center justify-center gap-3">
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 border-2 border-green-400/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-green-400 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <span className="text-sm font-medium">
                {t('trade.checking_wallet_status')}
                <LoadingDots />
              </span>
            </div>
          </div>
        ) : !isLoggedIn ? (
          <DynamicConnectButton buttonClassName={'w-full'}>
            <div className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 w-full text-center cursor-pointer font-medium">
              {t('trade.connect_wallet_to_swap')}
            </div>
          </DynamicConnectButton>
        ) : (
          <button
            onClick={handleUnstake}
            disabled={showUnstakeLoading}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 w-full font-medium"
          >
            {showUnstakeLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              t('trade.unstake_and_claim_rewards')
            )}
          </button>
        )}
      </div>
    </div>
  )
}
