import { ProfileWithStats } from '.'

export interface ProfileData {
  profiles: ProfileWithStats[]
  totalCount?: number
}

export interface ProfileSectionProps {
  walletAddress?: string
  hasSearched?: boolean
  profileData?: ProfileData | null
  error?: string | null
  isLoadingProfileData?: boolean
  title?: string
}
