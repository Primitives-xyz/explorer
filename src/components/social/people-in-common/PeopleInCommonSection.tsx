import { Avatar } from '@/components/common/avatar'
import Link from 'next/link'
import { Fragment } from 'react'

interface PersonInCommon {
  username: string
  image: string
}

interface PeopleInCommonSectionProps {
  topUsers: PersonInCommon[]
  totalAmount: number
  tokenName: string
}

const UserLink = ({ username }: { username: string }) => (
  <Link href={`/${username}`} className="hover:underline text-inherit">
    @{username}
  </Link>
)

export const PeopleInCommonSection = ({
  topUsers,
  totalAmount,
}: PeopleInCommonSectionProps) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-3">
        {topUsers.slice(0, 3).map((user, i) => (
          <div
            key={user.username}
            className="rounded-full border-2 border-black overflow-hidden"
            style={{ zIndex: 3 - i }}
          >
            <Avatar username={user.username} imageUrl={user.image} size={32} />
          </div>
        ))}
      </div>
      <span className="text-sm">
        {totalAmount > 3 ? (
          <>
            owned by{' '}
            {topUsers.slice(0, 3).map((user, index) => (
              <Fragment key={user.username}>
                <UserLink username={user.username} />
                {index < 2 && ', '}
              </Fragment>
            ))}{' '}
            and {totalAmount - 3} {totalAmount - 3 === 1 ? 'other' : 'others'}{' '}
            you follow
          </>
        ) : (
          <>
            owned by{' '}
            {topUsers.map((user, index) => (
              <Fragment key={user.username}>
                <UserLink username={user.username} />
                {index < topUsers.length - 1 && ', '}
              </Fragment>
            ))}
          </>
        )}
      </span>
    </div>
  )
}
