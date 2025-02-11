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

export const FollowingProfileList = ({
  profiles,
  loading,
  error,
}: FollowingProfileListProps) => {
  const router = useRouter()

  if (loading) {
    return (
      <div className="border border-green-800 bg-black/50 w-full overflow-hidden">
        <div className="border-b border-green-800 p-2">
          <div className="text-green-500 text-sm font-mono">
            {'>'} following
          </div>
        </div>
        <div className="p-4 text-center text-green-600 font-mono">
          {'>>> LOADING FOLLOWING LIST...'}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-green-800 bg-black/50 w-full overflow-hidden">
        <div className="border-b border-green-800 p-2">
          <div className="text-green-500 text-sm font-mono">
            {'>'} following
          </div>
        </div>
        <div className="p-4 text-center text-red-500 font-mono">
          {'>>> ERROR LOADING FOLLOWING LIST'}
        </div>
      </div>
    )
  }

  if (!profiles?.length) {
    return (
      <div className="border border-green-800 bg-black/50 w-full overflow-hidden">
        <div className="border-b border-green-800 p-2">
          <div className="text-green-500 text-sm font-mono">
            {'>'} following
          </div>
        </div>
        <div className="p-4 text-center text-green-600 font-mono">
          {'>>> NOT FOLLOWING ANYONE YET'}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden">
      <div className="border-b border-green-800 p-2">
        <div className="text-green-500 text-sm font-mono">{'>'} following</div>
      </div>
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
                      className="font-mono text-green-400 hover:text-green-300 transition-colors"
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
                        className="text-green-600 font-mono text-sm hover:text-green-500 transition-colors"
                      >
                        {walletId.slice(0, 4)}...{walletId.slice(-4)}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(walletId)
                        }}
                        className="text-green-600/50 hover:text-green-400/80 text-xs font-mono bg-green-900/20 px-1.5 py-0.5 rounded transition-colors"
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
    </div>
  )
}
