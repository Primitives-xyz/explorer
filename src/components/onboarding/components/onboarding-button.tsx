'use client'

import { useCreateProfile } from '@/components/tapestry/hooks/use-create-profile'
import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
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
  const [hasInitialized, setHasInitialized] = useState(false)
  const [actualProfileId, setActualProfileId] = useState<string | null>(null)
  const {
    mainProfile,
    walletAddress,
    loading: getCurrentUserLoading,
    socialCounts,
    refetch: refetchCurrentUser,
  } = useCurrentWallet()
  const [step, setStep] = useState(EOnboardingSteps.USERNAME)
  const { createProfile, loading: createProfileLoading } = useCreateProfile()
  const { updateProfile } = useUpdateProfile({
    profileId: actualProfileId || profileId,
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
    getCurrentUserLoading ||
    getIdentitiesLoading ||
    getSuggestedProfilesLoading ||
    createProfileLoading

  // Debug logging
  useEffect(() => {
    console.log('[OnboardingButton] Component mounted/updated:', {
      profileId,
      actualProfileId,
      mainProfile,
      hasSeenProfileSetupModal: mainProfile?.hasSeenProfileSetupModal,
      loading,
      open,
    })
  }, [profileId, actualProfileId, mainProfile, loading, open])

  // Auto-open for new users - run once when component mounts
  useEffect(() => {
    if (!hasInitialized && !loading && !mainProfile) {
      console.log(
        '[OnboardingButton] Initializing and auto-opening for new user'
      )
      setOpen(true)
      setHasInitialized(true)
    }
  }, [hasInitialized, loading, mainProfile])

  // Set actual profile ID when mainProfile becomes available
  useEffect(() => {
    if (mainProfile?.id && !actualProfileId) {
      setActualProfileId(mainProfile.id)
    }
  }, [mainProfile, actualProfileId])

  const getModalTitle = () => {
    if (step === EOnboardingSteps.FOLLOW) {
      return t('onboarding.onboarding_success')
    } else {
      return t('onboarding.create_profile')
    }
  }

  const finishOnboarding = async () => {
    if (!actualProfileId && !mainProfile?.id) return

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

  // Handle username submission - this will create the profile if it doesn't exist
  const handleUsernameSubmit = async (username: string) => {
    if (!mainProfile && !actualProfileId) {
      // Create profile with the chosen username
      try {
        const response = await createProfile({
          username,
          ownerWalletAddress: walletAddress,
        })

        console.log('[OnboardingButton] Profile creation response:', response)

        // The response might be in data property or directly
        const profileId =
          (response as any)?.profile?.id || (response as any)?.data?.profile?.id

        if (profileId) {
          setActualProfileId(profileId)
          // Refetch to update the current wallet state
          await refetchCurrentUser()
        }
      } catch (error) {
        console.error('[OnboardingButton] Failed to create profile:', error)
        throw error // Re-throw to be handled by the form
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={ButtonVariant.SECONDARY_SOCIAL} className="w-full">
          {mainProfile ? 'Complete Profile' : 'Create Profile'}
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

              {step === EOnboardingSteps.USERNAME && (
                <UpdateUsernameForm
                  suggestedUsernames={suggestedUsernames}
                  mainProfile={
                    mainProfile || {
                      id: actualProfileId || profileId,
                      username: '',
                      bio: '',
                      created_at: Date.now(),
                      namespace: 'solana_social_explorer',
                      blockchain: 'SOLANA' as any,
                      wallet: {
                        id: '',
                        created_at: Date.now(),
                        blockchain: 'SOLANA',
                        wallet_type: '',
                      },
                    }
                  }
                  setStep={setStep}
                  closeModal={() => setOpen(false)}
                  onUsernameSubmit={handleUsernameSubmit}
                />
              )}

              {step === EOnboardingSteps.IMAGE &&
                (mainProfile || actualProfileId) && (
                  <AddProfileImage
                    suggestedImages={suggestedImages}
                    mainProfile={
                      mainProfile || {
                        id: actualProfileId || profileId,
                        username: '',
                        bio: '',
                        created_at: Date.now(),
                        namespace: 'solana_social_explorer',
                        blockchain: 'SOLANA' as any,
                        wallet: {
                          id: '',
                          created_at: Date.now(),
                          blockchain: 'SOLANA',
                          wallet_type: '',
                        },
                      }
                    }
                    setStep={setStep}
                  />
                )}

              {step === EOnboardingSteps.BIO &&
                (mainProfile || actualProfileId) && (
                  <AddBioForm
                    suggestedBios={suggestedBios}
                    mainProfile={
                      mainProfile || {
                        id: actualProfileId || profileId,
                        username: '',
                        bio: '',
                        created_at: Date.now(),
                        namespace: 'solana_social_explorer',
                        blockchain: 'SOLANA' as any,
                        wallet: {
                          id: '',
                          created_at: Date.now(),
                          blockchain: 'SOLANA',
                          wallet_type: '',
                        },
                      }
                    }
                    setStep={setStep}
                  />
                )}

              {step === EOnboardingSteps.FOLLOW &&
                (mainProfile || actualProfileId) && (
                  <SuggestedFollow
                    mainProfile={
                      mainProfile || {
                        id: actualProfileId || profileId,
                        username: '',
                        bio: '',
                        created_at: Date.now(),
                        namespace: 'solana_social_explorer',
                        blockchain: 'SOLANA' as any,
                        wallet: {
                          id: '',
                          created_at: Date.now(),
                          blockchain: 'SOLANA',
                          wallet_type: '',
                        },
                      }
                    }
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
