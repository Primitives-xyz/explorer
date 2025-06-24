'use client'

import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { PoweredbyTapestry } from '../../../common/powered-by-tapestry'
import { Card, CardContent, Spinner } from '../../../ui'
import { useGetSuggestions } from '../../hooks/use-get-suggestions'
import { EOnboardingSteps } from '../../onboarding.models'
import { AddBioForm } from '../add-bio-form'
import { AddProfileImage } from '../add-profile-image'
import { StepsWrapper } from '../steps-wrapper'
import { SuggestedFollow } from './suggested-follow'
import { UpdateUsernameForm } from './update-username-form'

interface Props {
  profileId: string
}

export function Onboarding({ profileId }: Props) {
  const t = useTranslations()
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

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Card className="w-[80%] h-[80%] xl:w-[60%]">
        <CardContent className="w-full h-full flex flex-col">
          <div className="w-full h-full flex flex-col">
            <span>{getModalTitle()}</span>

            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <Spinner />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-between gap-5 flex-1">
                <div className="flex flex-col gap-10 flex-1 w-full">
                  {step !== EOnboardingSteps.FOLLOW && (
                    <StepsWrapper step={step} />
                  )}

                  {step === EOnboardingSteps.USERNAME && !!mainProfile && (
                    <UpdateUsernameForm
                      suggestedUsernames={suggestedUsernames}
                      mainProfile={mainProfile}
                      setStep={setStep}
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
                      setStep={setStep}
                    />
                  )}
                </div>
                <PoweredbyTapestry />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
