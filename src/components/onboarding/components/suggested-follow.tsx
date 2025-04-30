'use client'

import { useGetRecentProfiles } from '@/components/tapestry/hooks/use-get-recent-profiles'
import {
  IProfile,
  ISuggestedProfile,
} from '@/components/tapestry/models/profiles.models'
import {
  Button,
  ButtonVariant,
  FilterTabs,
  Paragraph,
  Spinner,
} from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useState } from 'react'
import { useGetLeaderboard } from '../../tapestry/hooks/use-get-leaderboard'
import { useGetSuggestedProfiles } from '../hooks/use-get-suggested-profiles'
import { EFollowUsersType, EOnboardingSteps } from '../onboarding.models'
import { FollowUserEntry } from './follow-user-entry'

const options = [
  { label: 'Top Traders', value: EFollowUsersType.TOP_TRADERS },
  { label: 'Recently Created', value: EFollowUsersType.RECENT },
]

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
  const {
    refetch: refetchCurrentUser,
    socialCounts,
    walletAddress,
  } = useCurrentWallet()
  const { profiles: recentProfiles, loading: getRecentProfilesLoading } =
    useGetRecentProfiles({
      skip: selectedType !== EFollowUsersType.RECENT,
    })
  const { profiles: suggestedProfiles, loading: getSuggestedProfilesLoading } =
    useGetSuggestedProfiles({
      walletAddress,
      skip: selectedType !== EFollowUsersType.FRIENDS,
    })

  const loadingUsers =
    loadingLeaderboard ||
    getRecentProfilesLoading ||
    getSuggestedProfilesLoading

  useEffect(() => {
    if (!!suggestedProfiles) {
      options.push({ label: 'Your Friends', value: EFollowUsersType.FRIENDS })
    }
  }, [suggestedProfiles])

  if (!mainProfile?.username) {
    return null
  }

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        <Paragraph>
          Follow at least 3 other profiles to finish onboarding and populate
          your feed. <br /> Here are some people you may know.
        </Paragraph>
        <div className="flex flex-col md:px-6">
          <FilterTabs
            options={options}
            selected={selectedType}
            onSelect={setSelectedType}
            className="md:mb-8 self-center"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-8 max-h-[300px] md:max-h-auto overflow-auto">
            {traders?.entries?.slice(0, 6).map((user) => (
              <FollowUserEntry
                key={user.profile.username}
                username={user.profile.username}
                image={user.profile.image}
                info={`${user.score} trade${user.score === 1 ? '' : 's'}`}
                mainUsername={mainProfile.username}
              />
            ))}
            {recentProfiles?.profiles
              ?.filter(
                (profile) => profile.profile.username !== mainProfile.username
              )
              .slice(0, 6)
              .map((user) => (
                <FollowUserEntry
                  key={user.profile.username}
                  username={user.profile.username}
                  image={user.profile.image}
                  mainUsername={mainProfile.username}
                />
              ))}
            {!!suggestedProfiles &&
              Object.entries(suggestedProfiles).map(
                ([key, item]: [string, ISuggestedProfile]) => {
                  return (
                    <FollowUserEntry
                      key={key}
                      username={item.profile.username}
                      image={item.profile.image}
                      mainUsername={mainProfile.username}
                    />
                  )
                }
              )}
          </div>
          {loadingUsers && (
            <div className="flex items-center justify-center w-full h-40">
              <Spinner />
            </div>
          )}
        </div>
      </div>
      <p className="flex md:hidden text-primary self-center">
        {socialCounts?.following ?? 0}/3
      </p>
      <div className="flex justify-between mt-auto">
        <Button
          onClick={() => setStep(EOnboardingSteps.BIO)}
          className="w-[48%] md:w-[160px]"
          variant={ButtonVariant.OUTLINE}
        >
          Back
        </Button>
        <Button
          onClick={closeModal}
          className="w-[48%] flex md:hidden"
          disabled={(socialCounts?.following ?? 0) < 3}
        >
          Complete
        </Button>
        <div className="hidden items-center gap-3 md:flex">
          <p className="text-primary">{socialCounts?.following ?? 0}/3</p>
          <Button
            onClick={closeModal}
            className="w-[160px]"
            disabled={(socialCounts?.following ?? 0) < 3}
          >
            Complete
          </Button>
        </div>
      </div>
    </>
  )
}
