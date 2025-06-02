'use client'

import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { PoweredbyTapestry } from '../../common/powered-by-tapestry'
import {
  Button,
  ButtonVariant,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Spinner,
} from '../../ui'
import { useGetSuggestions } from '../hooks/use-get-suggestions'
import { EOnboardingSteps } from '../onboarding.models'
import { AddBioForm } from './add-bio-form'
import { AddProfileImage } from './add-profile-image'
import { StepsWrapper } from './steps-wrapper'
import { SuggestedFollow } from './suggested-follow'
import { UpdateUsernameForm } from './update-username-form'

interface Props {
  profileId: string
}

export function OnboardingButton({ profileId }: Props) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const {
    mainProfile,
    walletAddress,
    loading: getCurrentUserLoading,
    socialCounts,
    refetch: refetchCurrentUser,
  } = useCurrentWallet()
  const [step, setStep] = useState(EOnboardingSteps.USERNAME)
  const { updateProfile } = useUpdateProfile({
    profileId,
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

  const getModalTitle = () => {
    if (step === EOnboardingSteps.FOLLOW) {
      return t('onboarding.onboarding_success')
    } else {
      return t('onboarding.create_profile')
    }
  }

  const finishOnboarding = async () => {
    await updateProfile({
      properties: [
        {
          key: 'hasSeenProfileSetupModal',
          value: true,
        },
      ],
    })
    refetchCurrentUser()
  }

  const onClose = () => {
    if (socialCounts?.following && socialCounts.following >= 3) {
      setOpen(false)
      finishOnboarding()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={ButtonVariant.SECONDARY_SOCIAL} className="w-full">
          Complete Profile
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-full md:max-w-3xl min-h-[90%] md:min-h-[600px] flex flex-col"
        onClose={onClose}
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

              {step === EOnboardingSteps.USERNAME && !!mainProfile && (
                <UpdateUsernameForm
                  suggestedUsernames={suggestedUsernames}
                  mainProfile={mainProfile}
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
