'use client'

import { PoweredbyTapestry } from '@/components/common/powered-by-tapestry'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { pudgyStorage } from '@/utils/pudgy-cookies'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useState } from 'react'
import { usePudgyPayment } from '../hooks/use-pudgy-payment'
import { EPudgyOnboardingStep } from '../pudgy.models'
import { PudgyClaimProfileStep } from './pudgy-claim-profile-step'
import { PudgyUpgradeBenefits } from './pudgy-upgrade-benefits'

interface Props {
  mainProfile: IProfile
  open: boolean
  setOpen: (open: boolean) => void
}

export function PudgyOnboardingModal({ mainProfile, open, setOpen }: Props) {
  const { refetch: refetchCurrentUser } = useCurrentWallet()
  const [step, setStep] = useState(EPudgyOnboardingStep.INTRO)
  const { updateProfile } = useUpdateProfile({
    profileId: mainProfile.username,
  })
  const { paymentDetails, balance, hasInsufficientBalance } = usePudgyPayment({
    profileId: mainProfile.id,
  })

  useEffect(() => {
    setStep(EPudgyOnboardingStep.INTRO)
  }, [open])

  const hasSeenPudgyOnboardingModal = async () => {
    await updateProfile({
      properties: [
        {
          key: 'hasSeenPudgyOnboardingModal',
          value: true,
        },
      ],
    })
    pudgyStorage.setHasSeenModal(mainProfile.username)
    refetchCurrentUser()
  }

  const onClose = () => {
    hasSeenPudgyOnboardingModal()
    setOpen(false)
  }
  const burnAmount = Math.ceil(
    parseFloat(String(paymentDetails?.amount || '0'))
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-full md:max-w-2xl md:min-h-[546px] flex flex-col"
        onClose={onClose}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            Pudgy Penguins x SSE: Unlock Your Official Profile
          </DialogTitle>
          <DialogDescription className="text-center">
            Burn {burnAmount} {paymentDetails?.tokenSymbol} to unlock{' '}
            <br className="mobile" /> your exclusive <br className="desktop" />{' '}
            Pudgy x SSE <br className="mobile" />
            profile experience.
            {balance !== undefined && (
              <span className="block mt-1 text-xs">
                Your balance: {balance} {paymentDetails?.tokenSymbol || 'PENGU'}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col">
          {step === EPudgyOnboardingStep.INTRO && (
            <PudgyUpgradeBenefits onClose={onClose} setStep={setStep} />
          )}
          {step === EPudgyOnboardingStep.CLAIM && (
            <PudgyClaimProfileStep
              setStep={setStep}
              mainProfile={mainProfile}
              onClose={onClose}
            />
          )}
        </div>
        <div className="mt-5">
          <PoweredbyTapestry />
        </div>
      </DialogContent>
    </Dialog>
  )
}
