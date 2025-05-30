'use client'

import { PoweredbyTapestry } from '@/components/common/powered-by-tapestry'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import {
  Button,
  ButtonVariant,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useState } from 'react'
import { EPudgyOnboardingStep } from '../pudgy.models'
import { PudgyClaimProfileStep } from './pudgy-claim-profile-step'
import { PudgyUpgradeBenefits } from './pudgy-upgrade-benefits'

interface Props {
  mainProfile: IProfile
}

export function PudgyOnboardingButton({ mainProfile }: Props) {
  const { refetch: refetchCurrentUser } = useCurrentWallet()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(EPudgyOnboardingStep.INTRO)
  const { updateProfile } = useUpdateProfile({
    username: mainProfile.username,
  })

  useEffect(() => {
    setStep(EPudgyOnboardingStep.INTRO)
  }, [open])

  useEffect(() => {
    console.log('mainProfile', mainProfile)
    if (!mainProfile.hasSeenPudgyOnboardingModal) {
      setOpen(true)
    }
  }, [mainProfile])

  const hasSeenPudgyOnboardingModal = async () => {
    await updateProfile({
      properties: [
        {
          key: 'hasSeenPudgyOnboardingModal',
          value: true,
        },
      ],
    })
    refetchCurrentUser()
  }

  const onClose = () => {
    hasSeenPudgyOnboardingModal()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={ButtonVariant.PUDGY_DEFAULT}>Claim Profile</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-full md:max-w-2xl min-h-[90%] md:min-h-[546px] flex flex-col"
        onClose={onClose}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            Pudgy Penguins x SSE: Unlock Your Official Profile
          </DialogTitle>
          <DialogDescription className="text-center">
            Burn 123 $PENGU to unlock your exclusive <br /> Pudgy x SSE profile
            experience.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col">
          {step === EPudgyOnboardingStep.INTRO && (
            <PudgyUpgradeBenefits onClose={onClose} setStep={setStep} />
          )}
          {step === EPudgyOnboardingStep.CLAIM && (
            <PudgyClaimProfileStep setStep={setStep} />
          )}
        </div>
        <div className="mt-5">
          <PoweredbyTapestry />
        </div>
      </DialogContent>
    </Dialog>
  )
}
