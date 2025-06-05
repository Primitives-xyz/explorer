'use client'

import { useGetFollowers } from '@/components/tapestry/hooks/use-get-followers'
import { useGetFollowersState } from '@/components/tapestry/hooks/use-get-followers-state'
import { useGetFollowing } from '@/components/tapestry/hooks/use-get-following'
import { Button, ButtonProps, ButtonSize, ButtonVariant } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isValidSolanaAddress } from '@/utils/validation'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { UserMinus, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props extends Omit<ButtonProps, 'children'> {
  followerUsername: string
  followeeUsername: string
  isPudgy?: boolean
  onFollowSuccess?: () => void
  children?: (isFollowing: boolean) => React.ReactNode
}

export function FollowButton({
  followerUsername,
  followeeUsername,
  isPudgy = false,
  onFollowSuccess,
  children,
  ...props
}: Props) {
  const {
    refetch: refetchCurrentUser,
    primaryWallet,
    walletAddress,
  } = useCurrentWallet()
  const { refetch: refetchGetFollowing } = useGetFollowing({
    username: followerUsername,
  })
  const { refetch: refetchGetFollowers } = useGetFollowers({
    username: followeeUsername,
  })
  const [transactionLoading, setTransactionLoading] = useState(false)
  const [refetchLoading, setRefetchLoading] = useState(false)
  const t = useTranslations()

  // Determine if followeeUsername is a wallet address
  const isWalletAddress = isValidSolanaAddress(followeeUsername)

  const {
    data,
    loading: loadingFollowersState,
    refetch: refetchFollowersState,
  } = useGetFollowersState({
    followeeUsername,
    followerUsername,
  })

  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState(
    data?.isFollowing
  )

  const loading = transactionLoading || refetchLoading || loadingFollowersState

  const refetch = async () => {
    setRefetchLoading(true)
    await Promise.all([
      refetchCurrentUser(),
      refetchGetFollowing(),
      refetchGetFollowers(),
      refetchFollowersState(),
    ])
    setRefetchLoading(false)
  }

  const handleFollow = async () => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      toast.error('Please connect your wallet')
      return
    }

    setIsFollowingOptimistic(true)
    setTransactionLoading(true)

    try {
      // Get profile IDs for both follower and followee
      let followerProfileId = followerUsername
      let followeeProfileId = followeeUsername

      if (isWalletAddress) {
        followeeProfileId = followeeUsername
      }

      // Get serialized transaction from our API (built with ZK data + fresh blockhash)
      // This uses the hybrid approach: Tapestry provides ZK data, we build transaction locally
      const response = await fetch('/api/followers/build-follow-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startId: followerProfileId,
          endId: followeeProfileId,
          followerWallet: walletAddress,
          namespace: 'nemoapp',
          type: 'follow',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }

      const { transaction } = await response.json()

      // Deserialize the transaction (same as staking flow)
      const serializedBuffer = Buffer.from(transaction, 'base64')
      const vtx = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        throw new Error('Wallet not connected')
      }

      // Sign the transaction
      const signer = await primaryWallet.getSigner()
      const signedTx = await signer.signTransaction(vtx)

      // Submit the transaction
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      const simulate = await connection.simulateTransaction(signedTx, {
        sigVerify: false,
      })

      if (simulate.value.err) {
        throw new Error(
          `Transaction simulation failed: ${JSON.stringify(simulate.value.err)}`
        )
      }

      const txid = await connection.sendRawTransaction(signedTx.serialize())

      const confirmToastId = toast('Confirming follow transaction...', {
        description: 'Waiting for blockchain confirmation',
        duration: 1000000000,
      })

      const confirmation = await connection.confirmTransaction({
        signature: txid,
        ...(await connection.getLatestBlockhash()),
      })

      toast.dismiss(confirmToastId)

      if (confirmation.value.err) {
        toast.error('Transaction failed', {
          description: 'Follow transaction failed, please try again',
        })
      } else {
        toast.success(
          `Successfully followed @${followeeUsername}! Tx: ${txid.slice(
            0,
            8
          )}...`
        )
        await refetch()
        onFollowSuccess?.()
      }
    } catch (error: any) {
      console.error('Failed to follow:', error)
      setIsFollowingOptimistic(false)
      toast.error(error.message || 'Failed to follow user')
    } finally {
      setTransactionLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      toast.error('Please connect your wallet')
      return
    }

    setIsFollowingOptimistic(false)
    setTransactionLoading(true)

    try {
      // Get profile IDs for both follower and followee (same logic as follow)
      let followerProfileId = followerUsername
      let followeeProfileId = followeeUsername

      if (isWalletAddress) {
        followeeProfileId = followeeUsername
      }

      // Get serialized transaction from our unified API (built with ZK data + fresh blockhash)
      // This uses the same hybrid approach but with type: "unfollow"
      const response = await fetch('/api/followers/build-follow-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startId: followerProfileId,
          endId: followeeProfileId,
          followerWallet: walletAddress,
          namespace: 'nemoapp',
          type: 'unfollow',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || 'Failed to create unfollow transaction'
        )
      }

      const { transaction } = await response.json()

      // Deserialize the transaction (same as staking flow)
      const serializedBuffer = Buffer.from(transaction, 'base64')
      const vtx = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        throw new Error('Wallet not connected')
      }

      // Sign the transaction
      const signer = await primaryWallet.getSigner()
      const signedTx = await signer.signTransaction(vtx)

      // Submit the transaction
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      const simulate = await connection.simulateTransaction(signedTx, {
        sigVerify: false,
      })

      if (simulate.value.err) {
        throw new Error(
          `Transaction simulation failed: ${JSON.stringify(simulate.value.err)}`
        )
      }

      const txid = await connection.sendRawTransaction(signedTx.serialize())

      const confirmToastId = toast('Confirming unfollow transaction...', {
        description: 'Waiting for blockchain confirmation',
        duration: 1000000000,
      })

      const confirmation = await connection.confirmTransaction({
        signature: txid,
        ...(await connection.getLatestBlockhash()),
      })

      toast.dismiss(confirmToastId)

      if (confirmation.value.err) {
        toast.error('Transaction failed', {
          description: 'Unfollow transaction failed, please try again',
        })
      } else {
        toast.success(
          `Successfully unfollowed @${followeeUsername}! Tx: ${txid.slice(
            0,
            8
          )}...`
        )
        await refetch()
      }
    } catch (error: any) {
      console.error('Failed to unfollow:', error)
      setIsFollowingOptimistic(true)
      toast.error(error.message || 'Failed to unfollow user')
    } finally {
      setTransactionLoading(false)
    }
  }

  if (followerUsername === followeeUsername) {
    return null
  }

  const isFollowing = isFollowingOptimistic ?? data?.isFollowing
  const isIcon =
    props.size === ButtonSize.ICON || props.size === ButtonSize.ICON_SM
  const iconSize =
    props.size === ButtonSize.ICON || props.size === ButtonSize.DEFAULT
      ? 18
      : 14

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        onClick={isFollowing ? handleUnfollow : handleFollow}
        loading={loading}
        disabled={loading}
        variant={
          isPudgy ? ButtonVariant.PUDGY_DEFAULT : ButtonVariant.SECONDARY_SOCIAL
        }
        {...props}
      >
        {!!children ? (
          children(!!isFollowing)
        ) : (
          <>
            {isFollowing ? (
              isIcon ? (
                <UserMinus size={iconSize} />
              ) : (
                <>
                  {!isPudgy && <UserMinus size={iconSize} />}{' '}
                  {t('common.follow.unfollow')}
                </>
              )
            ) : isIcon ? (
              <UserPlus size={iconSize} />
            ) : (
              <>
                {!isPudgy && <UserPlus size={iconSize} />}{' '}
                {t('common.follow.follow')}
              </>
            )}
          </>
        )}
      </Button>
    </div>
  )
}
