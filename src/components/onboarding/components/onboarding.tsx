'use client'

import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isValidSolanaAddress } from '@/utils/validation'
import { useEffect, useState } from 'react'
import { mutate } from 'swr'
import { PoweredbyTapestry } from '../../common/powered-by-tapestry'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Spinner,
} from '../../ui'
import { useGetSuggestions } from '../hooks/use-get-suggestions'
import { EOnboardingSteps } from '../onboarding.models'
import { AddBioForm } from './add-bio-form'
import { AddProfileImage } from './add-profile-image'
import { CreateUsernameForm } from './create-username-form'
import { StepsWrapper } from './steps-wrapper'
import { SuggestedFollow } from './suggested-follow'

export function Onboarding() {
  const [open, setOpen] = useState(false)

  const {
    isLoggedIn,
    profiles,
    mainProfile,
    walletAddress,
    loading: getCurrentUserLoading,
    socialCounts,
  } = useCurrentWallet()
  const [step, setStep] = useState(EOnboardingSteps.USERNAME)
  const [lockModal, setLockModal] = useState(true)
  const { updateProfile } = useUpdateProfile({
    username: mainProfile?.username ?? '',
  })

  const { identities, loading: getIdentitiesLoading } = useGetIdentities({
    walletAddress,
  })

  const {
    suggestedUsernames,
    suggestedImages,
    suggestedBios,
    loading: getSuggestedProfilesLoading,
  } = useGetSuggestions({
    suggestedProfiles: identities,
    loadingSuggestions: getIdentitiesLoading,
    walletAddress,
  })

  const loading =
    getCurrentUserLoading || getIdentitiesLoading || getSuggestedProfilesLoading

  const shouldShowOnboarding = () => {
    // Not logged in or profiles undefined
    if (!isLoggedIn || typeof profiles === 'undefined') {
      return false
    }

    // No profile
    if (!mainProfile) {
      return true
    }
    // No username or username is a wallet address
    if (!mainProfile.username || isValidSolanaAddress(mainProfile.username)) {
      return true
    }

    // Has not seen the setup modal
    if (!mainProfile.hasSeenProfileSetupModal) {
      return true
    }

    return false
  }

  useEffect(() => {
    if (shouldShowOnboarding()) {
      setOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainProfile, profiles, isLoggedIn])

  const getModalTitle = () => {
    if (step === EOnboardingSteps.FOLLOW) {
      return `Welcome @${mainProfile?.username}! Your profile has been successfully created!`
    } else {
      return 'Create Your Profile'
    }
  }

  useEffect(() => {
    const finishOnboarding = async () => {
      setLockModal(false)
      await updateProfile({
        properties: [
          {
            key: 'hasSeenProfileSetupModal',
            value: true,
          },
        ],
      })
      // Refetch profiles api (current user and profile page)
      mutate((key) => typeof key === 'string' && key.includes('profiles'))
    }

    if (socialCounts?.following && socialCounts.following >= 3) {
      finishOnboarding()
    }
  }, [socialCounts, mainProfile, updateProfile])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        isStatic={lockModal}
        hideCloseButton={lockModal}
        className="max-w-full md:max-w-3xl min-h-[90%] md:min-h-[600px] flex flex-col"
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
                  suggestedImages={suggestedImages}
                  mainProfile={mainProfile}
                  setStep={setStep}
                />
              )}

              {step === EOnboardingSteps.BIO && mainProfile && (
                <AddBioForm
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
