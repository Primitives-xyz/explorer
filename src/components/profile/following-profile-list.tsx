import { route } from '@/utils/routes'
import { useRouter } from 'next/navigation'

interface Wallet {
  id: string
  blockchain: string
}

interface Profile {
  id: string
  created_at: number
  namespace: string
  username: string
  bio: string | null
  image: string | null
  wallet: Wallet | null
}

interface FollowingProfileListProps {
  profiles: Profile[]
  loading: boolean
  error: any
}

const FollowingContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="border border-green-800 bg-black/50 w-full overflow-hidden">
    <div className="border-b border-green-800 p-2">
      <div className="text-sm font-mono">{'>'} following</div>
    </div>
    {children}
  </div>
)

export const FollowingProfileList = ({
  profiles,
  loading,
  error,
}: FollowingProfileListProps) => {
  const router = useRouter()

  if (loading) {
    return (
      <FollowingContainer>
        <div className="p-4 text-center font-mono">
          {'>>> LOADING FOLLOWING LIST...'}
        </div>
      </FollowingContainer>
    )
  }

  if (error) {
    return (
      <FollowingContainer>
        <div className="p-4 text-center text-red-500 font-mono">
          {'>>> ERROR LOADING FOLLOWING LIST'}
        </div>
      </FollowingContainer>
    )
  }

  if (!profiles?.length) {
    return (
      <FollowingContainer>
        <div className="p-4 text-center font-mono">
          {'>>> NOT FOLLOWING ANYONE YET'}
        </div>
      </FollowingContainer>
    )
  }

  return (
    <FollowingContainer>
      <div className="divide-y divide-green-800/30">
        {profiles.map((profile) => {
          const walletId = profile.wallet?.id
          return (
            <div key={profile.id} className="p-4 hover:bg-green-900/20">
              <div className="flex items-center space-x-3">
                {profile.image && (
                  <img
                    src={profile.image}
                    alt={profile.username}
                    className="w-10 h-10 rounded-full border border-green-800/50"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(route('address', { id: profile.username }))
                      }
                      className="font-mono hover: transition-colors"
                    >
                      @{profile.username}
                    </button>
                  </div>
                  {walletId && (
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() =>
                          router.push(route('address', { id: walletId }))
                        }
                        className="font-mono text-sm hover: transition-colors"
                      >
                        {walletId.slice(0, 4)}...{walletId.slice(-4)}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(walletId)
                        }}
                        className=" hover:/80 text-xs font-mono bg-green-900/20 px-1.5 py-0.5 rounded transition-colors"
                      >
                        [copy]
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </FollowingContainer>
  )
}
