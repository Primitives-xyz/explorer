'use client'

import { PoweredbyTapestry } from '@/components/common/powered-by-tapestry'
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
import { useEffect, useState } from 'react'
import { EPudgyOnboardingStep } from '../pudgy.models'
import { PudgyClaimProfileStep } from './pudgy-claim-profile-step'
import { PudgyUpgradeBenefits } from './pudgy-upgrade-benefits'

export function PudgyOnboardingButton() {
  // const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(EPudgyOnboardingStep.INTRO)

  useEffect(() => {
    setStep(EPudgyOnboardingStep.INTRO)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={ButtonVariant.PUDGY_DEFAULT}>Claim Profile</Button>
      </DialogTrigger>
      <DialogContent
        // isStatic={lockModal}
        // hideCloseButton={lockModal}
        className="max-w-full md:max-w-2xl min-h-[90%] md:min-h-[546px] flex flex-col"
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
        <div className="flex-1">
          {step === EPudgyOnboardingStep.INTRO && <PudgyUpgradeBenefits />}
          {step === EPudgyOnboardingStep.CLAIM && <PudgyClaimProfileStep />}
        </div>
        <div className="flex justify-between mt-auto">
          <Button
            onClick={() => setOpen(false)}
            className="w-[160px]"
            variant={ButtonVariant.OUTLINE}
          >
            Cancel
          </Button>
          {step === EPudgyOnboardingStep.INTRO ? (
            <Button
              onClick={() => setStep(EPudgyOnboardingStep.CLAIM)}
              className="w-[160px]"
            >
              Claim Profile
            </Button>
          ) : (
            <div className="relative">
              <Button
                onClick={() => setStep(EPudgyOnboardingStep.CLAIM)}
                className="w-[160px]"
              >
                Burn PENGU
              </Button>
              <p className="text-xs text-primary absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-2">
                -123 PENGU
              </p>
            </div>
          )}
        </div>
        <div className="mt-5">
          <PoweredbyTapestry />
        </div>
      </DialogContent>
    </Dialog>
  )
}
