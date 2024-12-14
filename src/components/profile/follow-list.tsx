'use client'

import { Button } from '@/components/common/button'
import { Card } from '@/components/common/card'
import { IGetSocialResponse } from '@/models/profile.models'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  following: IGetSocialResponse
  followers: IGetSocialResponse
}

export function FollowList({ following, followers }: Props) {
  const [followingListSelected, setFollowingListSelected] = useState(false)

  return (
    <div className="flex w-full space-x-4 mt-4">
      <Card className="w-1/2">
        <div className="w-full flex justify-center py-4 space-x-6">
          <Button
            onClick={() => setFollowingListSelected(false)}
            active={!followingListSelected}
          >
            Followers
          </Button>
          <Button
            onClick={() => setFollowingListSelected(true)}
            active={followingListSelected}
          >
            Following
          </Button>
        </div>
        <div className="h-[200px] overflow-auto">
          {(followingListSelected ? following : followers)?.profiles.map(
            (item, index) => (
              <ul key={index} className="list-disc list-inside">
                <ListEntries key={index} username={item.username} />
              </ul>
            ),
          )}
        </div>
      </Card>
    </div>
  )
}

function ListEntries({ username }: { username: string }) {
  return (
    <li className="ml-4 hover:underline">
      <Link href={`/${username}`}>{username}</Link>
    </li>
  )
}
