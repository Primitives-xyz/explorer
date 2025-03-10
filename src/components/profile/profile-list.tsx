import { ScrollableContent } from '@/components/common/scrollable-content'
import { useTranslations } from 'next-intl'
import { ProfileCard, ProfileWithStats } from './profile-card'

interface ProfileListProps {
  profiles: ProfileWithStats[]
  isLoading: boolean
}

export const ProfileList = ({ profiles, isLoading }: ProfileListProps) => {
  const t = useTranslations()

  return (
    <ScrollableContent
      isLoading={isLoading}
      isEmpty={profiles.length === 0}
      loadingText={t('profile_info.fetching_profiles')}
      emptyText={t('profile_info.no_profile_found')}
    >
      <div className="divide-y divide-green-800/30">
        {profiles.map((profile) => (
          <ProfileCard
            key={`${profile.profile.username}-${profile.namespace?.name}`}
            profile={profile}
          />
        ))}
      </div>
    </ScrollableContent>
  )
}
