import { Avatar } from '@/components/common/Avatar'

interface PersonInCommon {
  username: string
  image: string
}

interface PeopleInCommonSectionProps {
  topUsers: PersonInCommon[]
  totalAmount: number
  tokenName: string
}

export const PeopleInCommonSection = ({
  topUsers,
  totalAmount,
  tokenName,
}: PeopleInCommonSectionProps) => {
  return (
    <div className="flex items-center gap-1 font-sans">
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
      <span className="text-sm text-gray-300">
        {totalAmount > 3 ? (
          <>
            {topUsers
              .slice(0, 3)
              .map((user) => `@${user.username}`)
              .join(', ')}{' '}
            and {totalAmount - 3} others own {tokenName}
          </>
        ) : (
          <>
            {topUsers.map((user) => `@${user.username}`).join(', ')} owns{' '}
            {tokenName}
          </>
        )}
      </span>
    </div>
  )
}
