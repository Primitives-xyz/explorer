import { useStakeInfo } from '@/components-new-version/stake/hooks/useStakeInfo'
import { Button, ButtonVariant, Spinner } from '@/components-new-version/ui'
import { useToast } from '@/components-new-version/ui/toast/hooks/use-toast'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function UnstakeForm() {
  const t = useTranslations()
  const { toast } = useToast()
  const {
    isLoggedIn,
    sdkHasLoaded,
    walletAddress,
    primaryWallet,
    setShowAuthFlow,
  } = useCurrentWallet()
  const [showUnstakeLoading, setShowUnstakeLoading] = useState<boolean>(false)
  const { refreshUserInfo } = useStakeInfo({})

  if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
    throw new Error('Wallet not connected')
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

  const renderUnstakeButton = () => {
    if (!sdkHasLoaded) {
      return (
        <div className="flex items-center justify-center gap-2">
          <Spinner />
          <p>{t('trade.checking_wallet_status')}</p>
        </div>
      )
    }

    if (!isLoggedIn) {
      return (
        <Button
          variant={ButtonVariant.OUTLINE}
          expand
          onClick={() => setShowAuthFlow(true)}
        >
          {t('common.connect_wallet')}
        </Button>
      )
    }

    return (
      <Button expand onClick={handleUnstake} disabled={showUnstakeLoading}>
        {showUnstakeLoading ? (
          <Spinner />
        ) : (
          t('trade.unstake_and_claim_rewards')
        )}
      </Button>
    )
  }

  return <div>{renderUnstakeButton()}</div>
}
