'use client'

import { ProfileContent } from './profile-content'
import { HolderProvider } from '../auth/hooks/use-holder-context'
import { AuthWrapper } from '../auth/AuthWrapper'

interface ProfileWrapperProps {
  username: string
}

export function ProfileWrapper({ username }: ProfileWrapperProps) {
  return (
    <HolderProvider>
      <AuthWrapper>
        <ProfileContent username={username} />
      </AuthWrapper>
    </HolderProvider>
  )
}
