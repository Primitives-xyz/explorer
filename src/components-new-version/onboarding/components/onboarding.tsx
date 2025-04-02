'use client'

import { useEffect, useState } from 'react'
import { PoweredbyTapestry } from '../../common/powered-by-tapestry'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Spinner,
} from '../../ui'
import { useCurrentWallet } from '../../utils/use-current-wallet'
import { EOnboardingSteps } from '../onboarding.models'
import { AddBioForm } from './add-bio-form'
import { AddProfileImage } from './add-profile-image'
import { CreateUsernameForm } from './create-username-form'
import { StepsWrapper } from './steps-wrapper'
import { SuggestedFollow } from './suggested-follow'

export function Onboarding() {
  const [open, setOpen] = useState(false)
  const { mainProfile, walletAddress, loading, isLoggedIn } = useCurrentWallet()
  const [step, setStep] = useState(EOnboardingSteps.USERNAME)

  useEffect(() => {
    if (
      isLoggedIn &&
      !loading &&
      mainProfile &&
      !mainProfile.hasSeenProfileSetupModal
    ) {
      setOpen(true)
    }
  }, [mainProfile, loading, isLoggedIn])

  const getModalTitle = () => {
    if (step === EOnboardingSteps.FOLLOW) {
      return `Welcome @${mainProfile?.username}! Your profile has been successfully created!`
    } else {
      return 'Create your profile'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        isStatic={step !== EOnboardingSteps.FOLLOW}
        hideCloseButton={step !== EOnboardingSteps.FOLLOW}
        className="max-w-3xl min-h-[600px] flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-between gap-5 flex-1">
            <div className="flex flex-col gap-10 flex-1 w-full">
              {step !== EOnboardingSteps.FOLLOW && <StepsWrapper step={step} />}

              {step === EOnboardingSteps.USERNAME && (
                <CreateUsernameForm
                  walletAddress={walletAddress}
                  setStep={setStep}
                />
              )}

              {step === EOnboardingSteps.IMAGE && mainProfile && (
                <AddProfileImage
                  walletAddress={walletAddress}
                  mainProfile={mainProfile}
                  setStep={setStep}
                />
              )}

              {step === EOnboardingSteps.BIO && mainProfile && (
                <AddBioForm
                  walletAddress={walletAddress}
                  mainProfile={mainProfile}
                  setStep={setStep}
                />
              )}

              {step === EOnboardingSteps.FOLLOW && mainProfile && (
                <SuggestedFollow mainProfile={mainProfile} />
              )}
            </div>
            <PoweredbyTapestry />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
