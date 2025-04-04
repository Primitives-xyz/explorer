'use client'

import { useGetIdentities } from '@/components-new-version/tapestry/hooks/use-get-identities'
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
import { useGetSuggestedProfiles } from '../hooks/use-get-suggested-profiles'
import { EOnboardingSteps } from '../onboarding.models'
import { AddBioForm } from './add-bio-form'
import { AddProfileImage } from './add-profile-image'
import { CreateUsernameForm } from './create-username-form'
import { StepsWrapper } from './steps-wrapper'
import { SuggestedFollow } from './suggested-follow'

export function Onboarding() {
  const [open, setOpen] = useState(false)
  const {
    profiles,
    mainProfile,
    walletAddress,
    loading: getCurrentUserLoading,
    isLoggedIn,
    socialCounts,
  } = useCurrentWallet()
  const [step, setStep] = useState(EOnboardingSteps.USERNAME)
  const [lockModal, setLockModal] = useState(true)

  const { identities, loading: getIdentitiesLoading } = useGetIdentities({
    walletAddress,
  })

  const {
    suggestedUsernames,
    suggestedImages,
    suggestedBios,
    loading: getSuggestedProfilesLoading,
  } = useGetSuggestedProfiles({
    suggestedProfiles: identities,
    loadingSuggestions: getIdentitiesLoading,
    walletAddress,
  })

  const loading =
    getCurrentUserLoading || getIdentitiesLoading || getSuggestedProfilesLoading

  useEffect(() => {
    if (
      isLoggedIn &&
      typeof profiles !== 'undefined' &&
      (!mainProfile || (mainProfile && !mainProfile.hasSeenProfileSetupModal))
    ) {
      if (!!mainProfile?.bio) {
        setStep(EOnboardingSteps.FOLLOW)
      } else if (!!mainProfile?.image) {
        setStep(EOnboardingSteps.BIO)
      } else if (!!mainProfile?.username) {
        setStep(EOnboardingSteps.IMAGE)
      } else {
        setStep(EOnboardingSteps.USERNAME)
      }
      setOpen(true)
    }
  }, [mainProfile, isLoggedIn, profiles])

  const getModalTitle = () => {
    if (step === EOnboardingSteps.FOLLOW) {
      return `Welcome @${mainProfile?.username}! Your profile has been successfully created!`
    } else {
      return 'Create Your Profile'
    }
  }

  useEffect(() => {
    if (socialCounts?.following && socialCounts.following >= 3) {
      setLockModal(false)
    }
  }, [socialCounts])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        isStatic={lockModal}
        hideCloseButton={lockModal}
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
                  suggestedUsernames={suggestedUsernames}
                  setStep={setStep}
                  closeModal={() => setOpen(false)}
                />
              )}

              {step === EOnboardingSteps.IMAGE && mainProfile && (
                <AddProfileImage
                  walletAddress={walletAddress}
                  suggestedImages={suggestedImages}
                  mainProfile={mainProfile}
                  setStep={setStep}
                />
              )}

              {step === EOnboardingSteps.BIO && mainProfile && (
                <AddBioForm
                  walletAddress={walletAddress}
                  suggestedBios={suggestedBios}
                  mainProfile={mainProfile}
                  setStep={setStep}
                />
              )}

              {step === EOnboardingSteps.FOLLOW && mainProfile && (
                <SuggestedFollow
                  mainProfile={mainProfile}
                  closeModal={() => setOpen(false)}
                  setStep={setStep}
                />
              )}
            </div>
            <PoweredbyTapestry />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
