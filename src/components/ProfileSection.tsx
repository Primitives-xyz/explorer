import { ProfileWithStats } from '../types'

export const ProfileSection = ({
  profiles,
}: {
  profiles: ProfileWithStats[]
}) => (
  <div className="border border-green-800 bg-black/50">
    {/* Header */}
    <div className="border-b border-green-800 p-2">
      <div className="flex justify-between items-center">
        <div className="text-green-500 text-sm font-mono">
          {'>'} social_profiles.sol
        </div>
        <div className="text-xs text-green-600 font-mono">
          COUNT: {profiles.length}
        </div>
      </div>
    </div>

    {/* Profile List */}
    <div className="divide-y divide-green-800/30">
      {profiles.map((profile) => (
        <div key={profile.profile.id} className="p-3 hover:bg-green-900/10">
          <div className="flex flex-col gap-2">
            {/* Profile Header */}
            <div className="flex items-center gap-3">
              {profile.profile.image && (
                <img
                  src={profile.profile.image}
                  alt=""
                  className="w-10 h-10 rounded-sm opacity-80 bg-green-900/20 p-1"
                />
              )}
              <div className="flex-1">
                <div className="text-green-300 font-mono bg-green-900/20 px-1.5 py-0.5 rounded inline-block">
                  {profile.profile.username}
                </div>
                <div className="text-xs text-green-600 font-mono mt-1 truncate">
                  {profile.wallet.address}
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            {profile.followStats && (
              <div className="space-y-1 bg-green-900/5 p-2 rounded text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">Followers:</span>
                  <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                    {profile.followStats.followers}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">Following:</span>
                  <span className="text-green-500 bg-green-900/20 px-1.5 py-0.5 rounded">
                    {profile.followStats.following}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)
