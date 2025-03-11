'use client'

import { Button } from '@/components/common/button'
import { Modal } from '@/components/common/modal'
import { ProfileCard } from '@/components/profile-card'
import { useGetFollowers } from '@/components/profile/hooks/use-get-followers'
import { useGetFollowing } from '@/components/profile/hooks/use-get-following'
import { Badge } from '@/components/ui/badge'
import { IUser } from '@/components/user-header/models/user.models'
import { Users } from 'lucide-react'
import { useState } from 'react'

interface Props {
  user: IUser
}

export function SocialStats({ user }: Props) {
  const [displayModal, setDisplayModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'followers' | 'following'>(
    'followers'
  )

  const { following } = useGetFollowing(user.username)
  const { followers } = useGetFollowers(user.username)

  const handleOpenModal = (tab: 'followers' | 'following') => {
    setSelectedTab(tab)
    setDisplayModal(true)
  }

  const data =
    selectedTab === 'followers' ? followers?.profiles : following?.profiles

  return (
    <>
      <Button variant="ghost" onClick={() => handleOpenModal('followers')}>
        <Badge
          variant="outline"
          className="text-xs font-mono border-green-500/50 text-green-400"
        >
          <Users className="w-3 h-3 mr-1" />
          {user.isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            `${user.socialCounts?.followers || 0} followers`
          )}
        </Badge>
      </Button>

      <Button variant="ghost" onClick={() => handleOpenModal('following')}>
        <Badge
          variant="outline"
          className="text-xs font-mono border-green-500/50 text-green-400"
        >
          <Users className="w-3 h-3 mr-1" />
          {user.isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            `${user.socialCounts?.following || 0} following`
          )}
        </Badge>
      </Button>

      <Modal
        isOpen={displayModal}
        onClose={() => setDisplayModal(false)}
        title={`View ${selectedTab}`}
        className="!max-w-[500px]"
      >
        {data?.length ? (
          <ul className="h-[400px] overflow-auto">
            {data.map((elem) => {
              return <ProfileCard key={elem.id} profile={elem} />
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No {selectedTab} found.</p>
        )}
      </Modal>
    </>
  )
}
