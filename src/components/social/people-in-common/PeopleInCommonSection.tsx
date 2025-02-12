import { Avatar } from '@/components/common/Avatar'
import Link from 'next/link'

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
  tokenName,
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
        owned by{' '}
        {topUsers.slice(0, 3).map((user, index) => (
          <>
            <UserLink key={user.username} username={user.username} />
            {index < Math.min(topUsers.length, 3) - 1 && ', '}
          </>
        ))}
        {totalAmount > 3 && (
          <>
            {' '}
            and {totalAmount - 3} {totalAmount - 3 === 1 ? 'other' : 'others'} you
            follow
          </>
        )}
      </span>
    </div>
  )
}
