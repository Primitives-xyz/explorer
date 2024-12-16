import { ProfileWithStats } from '../types'

export const ProfileSection = ({
  profiles,
}: {
  profiles: ProfileWithStats[]
}) => (
  <section className="border border-green-800 p-2">
    <div className="text-xs text-green-600 mb-2">== SOCIAL_PROFILES ==</div>
    {profiles.map((profile) => (
      <div
        key={profile.profile.id}
        className="mb-3 last:mb-0 border-t border-green-900/50 pt-2"
      >
        <div className="flex items-start gap-3">
          {profile.profile.image && (
            <img
              src={profile.profile.image}
              alt=""
              className="w-10 h-10 rounded-sm opacity-80"
            />
          )}
          <div className="flex-1">
            <div className="text-green-300">{profile.profile.username}</div>
            <div className="text-xs text-green-600 font-light">
              {profile.wallet.address}
            </div>
            {profile.followStats && (
              <div className="text-xs mt-1">
                <span className="text-green-500">
                  {profile.followStats.followers}
                </span>{' '}
                followers |
                <span className="text-green-500">
                  {' '}
                  {profile.followStats.following}
                </span>{' '}
                following
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
  </section>
)
