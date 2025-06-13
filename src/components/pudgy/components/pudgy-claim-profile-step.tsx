'use client'

import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import { Button, ButtonVariant, Input, Label } from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Send,
  Wallet,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { usePudgyPayment } from '../hooks/use-pudgy-payment'
import { EPudgyOnboardingStep, EPudgyTheme } from '../pudgy.models'
import { PudgyAvatarFrameSelection } from './pudgy-avatar-frame-selection'
import { PudgyThemeSelection } from './pudgy-theme-selection'

interface Props {
  setStep: (step: EPudgyOnboardingStep) => void
  mainProfile: IProfile
}

export function PudgyClaimProfileStep({ setStep, mainProfile }: Props) {
  const t = useTranslations()
  const { push } = useRouter()
  const { refetch: refetchCurrentUser } = useCurrentWallet()
  const [pudgyTheme, setPudgyTheme] = useState(EPudgyTheme.BLUE)
  const [pudgyFrame, setPudgyFrame] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { updateProfile } = useUpdateProfile({
    profileId: mainProfile.id,
  })

  // Simplified payment hook with completion callback
  const {
    paymentDetails,
    transactionStatus,
    isComplete,
    loading,
    error,
    pay,
    balance,
    rawBalance,
    hasInsufficientBalance,
    requiredAmount,
    refreshBalance,
  } = usePudgyPayment({
    profileId: mainProfile.id,
    onComplete: async () => {
      try {
        // Clear the polling interval when payment is complete
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        // Update profile with Pudgy settings
        await updateProfile({
          username: mainProfile.username,
          properties: [
            { key: 'pudgyTheme', value: pudgyTheme },
            { key: 'pudgyFrame', value: pudgyFrame },
          ],
        })

        await refetchCurrentUser()
        toast.success('Pudgy profile activated successfully!')

        // Navigate to profile
        push(route('entity', { id: mainProfile.id }))
      } catch (error) {
        console.error('Failed to update profile:', error)
        toast.error('Failed to update profile. Please try again.')
      }
    },
  })

  // Set up balance polling
  useEffect(() => {
    // Only poll if we have insufficient balance and no active transaction
    if (
      hasInsufficientBalance &&
      !transactionStatus &&
      !isComplete &&
      refreshBalance
    ) {
      // Initial refresh
      refreshBalance()

      // Set up interval for polling every 5 seconds
      intervalRef.current = setInterval(() => {
        refreshBalance()
      }, 5000)
    }

    // Cleanup interval when conditions change or component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [hasInsufficientBalance, transactionStatus, isComplete, refreshBalance])

  const handleBurn = async () => {
    try {
      // Clear the polling interval when starting a transaction
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      await pay()
    } catch (error) {
      toast.error('Transaction failed. Please try again.')
    }
  }

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : error.message)
    }
  }, [error])

  // Get button content based on transaction status
  const getButtonContent = () => {
    if (isComplete) {
      return (
        <>
          <CheckCircle className="w-5 h-5 mr-2" />
          Profile Activated!
        </>
      )
    }

    if (!transactionStatus) {
      return <>Burn {paymentDetails?.tokenSymbol || 'PENGU'}</>
    }

    switch (transactionStatus.status) {
      case 'sending':
        return (
          <>
            <Send className="w-5 h-5 mr-2" />
            Sending Transaction...
          </>
        )
      case 'sent':
        return (
          <>
            <Send className="w-5 h-5 mr-2" />
            Transaction Sent...
          </>
        )
      case 'confirming':
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Confirming Transaction...
          </>
        )
      case 'confirmed':
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Activating Profile...
          </>
        )
      case 'failed':
      case 'timeout':
        return (
          <>
            <AlertTriangle className="w-5 h-5 mr-2" />
            Transaction Failed - Retry
          </>
        )
      default:
        return <>Burn {paymentDetails?.tokenSymbol || 'PENGU'}</>
    }
  }

  const isButtonDisabled = hasInsufficientBalance || loading || isComplete

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Integrated Header Section */}
      <div className="mb-6">
        <Button
          size="sm"
          variant={ButtonVariant.GHOST}
          onClick={() => setStep(EPudgyOnboardingStep.INTRO)}
          type="button"
          className="mb-4 text-muted-foreground hover:text-foreground transition-colors -ml-2"
        >
          ← Back
        </Button>

        {/* Avatar - The Hero */}
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-[220px]">
            <PudgyAvatarFrameSelection
              displayPudgyFrame={pudgyFrame}
              setDisplayPudgyFrame={setPudgyFrame}
              pudgyTheme={pudgyTheme}
            />
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="space-y-4 mb-6">
        {/* Username (Read-only) */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Your Username</Label>
          <Input
            value={mainProfile.username}
            readOnly
            className="h-10 bg-muted/50 cursor-not-allowed font-medium select-none opacity-70"
            onFocus={(e) => e.target.blur()}
          />
          <p className="text-xs text-muted-foreground">
            This will be your permanent Pudgy x SSE username
          </p>
        </div>

        {/* Theme Selection */}
        <PudgyThemeSelection
          selectedTheme={pudgyTheme}
          setSelectedTheme={setPudgyTheme}
        />
      </div>

      {/* Action Section */}
      {hasInsufficientBalance ? (
        <div className="space-y-4">
          {/* Insufficient Balance Card */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="font-semibold text-destructive">
                    Insufficient Balance
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need{' '}
                    {(() => {
                      const currentBalance = Math.floor(
                        Number(rawBalance) / 10 ** 6
                      )
                      const needed = requiredAmount - currentBalance
                      // Ensure we never show negative values
                      return Math.max(0, needed)
                    })()}{' '}
                    more PENGU to unlock your profile
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Required</p>
                    <p className="font-semibold">{requiredAmount} PENGU</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your balance</p>
                    <p className="font-semibold text-destructive">
                      {Math.floor(Number(rawBalance) / 10 ** 6)} PENGU
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <Link
            href="https://www.sse.gg/trade?inputMint=So11111111111111111111111111111111111111112&outputMint=2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              className="w-full h-12 text-base font-semibold"
              type="button"
            >
              <Wallet size={18} className="mr-2" />
              Buy PENGU on SSE
              <ExternalLink size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isButtonDisabled}
            onClick={handleBurn}
            type="button"
          >
            {getButtonContent()}
          </Button>

          {/* Cost Display - Only show when we have data and no transaction */}
          {paymentDetails && !transactionStatus && !isComplete && (
            <div className="text-center text-sm text-muted-foreground">
              Burns {requiredAmount} {paymentDetails.tokenSymbol}
            </div>
          )}

          {/* Transaction Link */}
          {transactionStatus?.signature && !isComplete && (
            <div className="text-center">
              <a
                href={`https://solscan.io/tx/${transactionStatus.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                View transaction
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
