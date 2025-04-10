'use client'

import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { route } from '@/components-new-version/utils/route'
import { useGetSearchProfiles } from '../hooks/use-get-search-profiles'
import { SearchResultsEntry } from './search-results-entry'

interface Props {
  query: string
  closePopover: () => void
}

export function SearchResultsProfiles({ query, closePopover }: Props) {
  const { profiles, loading } = useGetSearchProfiles({ query })

  return (
    <div>
      <div className="flex items-center justify-between text-xs p-3">
        <h3>Profiles</h3>
        <span className="text-muted-foreground">Platform</span>
      </div>
      <div>
        {profiles.map((entry, index) => (
          <SearchResultsEntry
            key={entry.profile.id + index}
            image={
              <Avatar
                imageUrl={entry.profile.image}
                username={entry.profile.username}
              />
            }
            title={entry.profile.username
              .split(new RegExp(`(${query})`, 'i'))
              .map((part, index) => (
                <span
                  key={index}
                  className={
                    part.toLowerCase() === query.toLowerCase()
                      ? 'text-secondary font-semibold'
                      : ''
                  }
                >
                  {part}
                </span>
              ))}
            subtitle={
              <>
                {entry.socialCounts?.followers} follower
                {entry.socialCounts?.followers !== 1 ? 's' : ''} ·{' '}
                {entry.socialCounts?.following} following
              </>
            }
            rightContent={entry.namespace.readableName}
            href={route('entity', {
              id: entry.profile.id,
            })}
            closePopover={closePopover}
          />
        ))}
        {profiles.length === 0 && !loading && (
          <div className="text-xs text-muted-foreground p-3">No results</div>
        )}
        {loading && (
          <div className="text-xs text-muted-foreground p-3 loading-dots">
            Loading
          </div>
        )}
      </div>
    </div>
  )
}
