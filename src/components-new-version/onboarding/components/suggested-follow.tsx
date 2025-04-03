'use client'

import { IProfile } from '@/components-new-version/models/profiles.models'
import { useGetRecentProfiles } from '@/components-new-version/tapestry/hooks/use-get-recent-profiles'
import {
  Button,
  ButtonVariant,
  FilterTabs,
  Paragraph,
  Spinner,
} from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useState } from 'react'
import { useGetLeaderboard } from '../../tapestry/hooks/use-get-leaderboard'
import { useUpdateProfile } from '../../tapestry/hooks/use-update-profile'
import { EFollowUsersType, EOnboardingSteps } from '../onboarding.models'
import { FollowUserEntry } from './follow-user-entry'

interface Props {
  mainProfile: IProfile
  closeModal: () => void
  setStep: (step: EOnboardingSteps) => void
}

export function SuggestedFollow({ mainProfile, closeModal, setStep }: Props) {
  const [selectedType, setSelectedType] = useState(EFollowUsersType.TOP_TRADERS)
  const { traders, loading: loadingLeaderboard } = useGetLeaderboard({
    skip: selectedType !== EFollowUsersType.TOP_TRADERS,
  })
  const { updateProfile, loading: updateProfileLoading } = useUpdateProfile({
    username: mainProfile.username,
  })
  const { refetch: refetchCurrentUser, socialCounts } = useCurrentWallet()
  const { profiles, loading: getRecentProfilesLoading } = useGetRecentProfiles({
    skip: selectedType !== EFollowUsersType.RECENT,
  })

  const options = [
    { label: 'Top Traders', value: EFollowUsersType.TOP_TRADERS },
    // { label: 'Your Friends', value: EFollowUsersType.FRIENDS },
    { label: 'Recently Created', value: EFollowUsersType.RECENT },
  ]

  const loadingUsers = loadingLeaderboard || getRecentProfilesLoading

  const onClickDone = async () => {
    closeModal()
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

  if (!mainProfile?.username) {
    return null
  }

  return (
    <>
      <div className="space-y-8">
        <Paragraph>
          Follow at least 3 other profiles to finish onboarding and populate
          your feed. <br /> Here are some people you may know.
        </Paragraph>
        <div className="flex flex-col px-6">
          <FilterTabs
            options={options}
            selected={selectedType}
            onSelect={setSelectedType}
            className="mb-8"
          />
          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            {traders?.entries?.slice(0, 6).map((user) => (
              <FollowUserEntry
                key={user.profile.username}
                username={user.profile.username}
                image={user.profile.image}
                info={`Trades ${user.score}`}
                mainUsername={mainProfile.username}
              />
            ))}
            {profiles?.profiles
              ?.filter(
                (profile) => profile.profile.username !== mainProfile.username
              )
              .slice(0, 6)
              .map((user) => (
                <FollowUserEntry
                  key={user.profile.username}
                  username={user.profile.username}
                  image={user.profile.image}
                  info={`${user.socialCounts?.followers ?? 0} follower${
                    user.socialCounts?.followers === 1 ? '' : 's'
                  }`}
                  mainUsername={mainProfile.username}
                />
              ))}
          </div>
          {loadingUsers && (
            <div className="flex items-center justify-center w-full h-40">
              <Spinner />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-auto">
        <Button
          onClick={() => setStep(EOnboardingSteps.BIO)}
          className="w-[160px]"
          variant={ButtonVariant.OUTLINE}
        >
          Back
        </Button>
        <div className="flex items-center gap-3">
          <p className="text-primary">{socialCounts?.following ?? 0}/3</p>
          <Button
            onClick={onClickDone}
            className="w-[160px]"
            loading={updateProfileLoading}
            disabled={(socialCounts?.following ?? 0) < 3}
          >
            Complete
          </Button>
        </div>
      </div>
    </>
  )
}
