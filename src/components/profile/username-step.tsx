'use client'

import { Input } from '@/components/form/input'
import { SubmitButton } from '@/components/form/submit-button'
import { SuggestedUsername } from '@/types/profile.types'

interface UsernameStepProps {
  username: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSuggestedUsernameClick: (suggestedUsername: string) => void
  suggestedUsernames: SuggestedUsername[]
  usernameGroups: Map<string, SuggestedUsername[]>
  loadingSuggestions: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function UsernameStep({
  username,
  handleInputChange,
  handleSuggestedUsernameClick,
  suggestedUsernames,
  usernameGroups,
  loadingSuggestions,
  onSubmit,
}: UsernameStepProps) {
  // Generate skeleton placeholders for the loading state - use just 1 for mobile, 2 for desktop
  // to match what's visible in the viewport without scrolling
  const skeletonItems = Array.from({ length: 2 }, (_, i) => i)

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-xl font-medium text-green-400">Get Started</h3>
        <p className="text-lg text-gray-300">
          Choose a unique username for your profile. This will be your identity
          across the platform.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-base font-medium text-gray-200"
            >
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={handleInputChange}
              name="username"
              placeholder="Enter username (letters and numbers only)"
              className="w-full text-lg py-3 px-4 bg-black/50 border-green-500/30 focus:border-green-400 rounded-lg transition-all duration-200"
            />
            <p className="text-sm text-gray-400 mt-1">
              Only lowercase letters and numbers are allowed
            </p>
          </div>
        </div>

        {(suggestedUsernames.length > 0 || loadingSuggestions) && (
          <div className="space-y-4 bg-black/30 rounded-xl p-5 border border-green-500/20">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-green-400">
                Suggested Usernames
              </h4>
              {!loadingSuggestions && (
                <span className="text-sm text-gray-400 bg-black/50 px-2 py-1 rounded-md">
                  {suggestedUsernames.length} available
                </span>
              )}
              {loadingSuggestions && (
                <span className="text-sm text-gray-400 bg-black/50 px-2 py-1 rounded-md">
                  Loading...
                </span>
              )}
            </div>

            {loadingSuggestions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto p-2 -mx-2 custom-scrollbar">
                {skeletonItems.map((id) => (
                  <div
                    key={id}
                    className="px-4 py-3 rounded-lg bg-black/50 border border-green-500/10 flex items-center gap-3 h-[58px] relative"
                  >
                    <div className="w-6 h-6 min-w-[24px] rounded-full bg-green-900/20 animate-pulse opacity-70"></div>
                    <div className="flex-1 space-y-2">
                      <div
                        className="h-4 bg-green-900/20 rounded w-3/4 animate-pulse opacity-70"
                        style={{ animationDelay: `${id * 100}ms` }}
                      ></div>
                      <div
                        className="h-3 bg-green-900/10 rounded w-1/2 animate-pulse opacity-70"
                        style={{ animationDelay: `${id * 150}ms` }}
                      ></div>
                    </div>
                    {id === 0 && (
                      <div className="absolute -top-2 -right-2 bg-green-900/20 text-transparent text-xs rounded-full w-6 h-6 animate-pulse opacity-70"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto p-2 -mx-2 custom-scrollbar">
                {suggestedUsernames.map((suggestion) => {
                  const relatedUsernames =
                    usernameGroups.get(suggestion.username) || []
                  const hasMultipleNamespaces = relatedUsernames.length > 1
                  const isRelatedToSelected =
                    username &&
                    relatedUsernames.some(
                      (related) => related.username === username
                    )

                  return (
                    <button
                      key={`${suggestion.namespace}-${suggestion.username}`}
                      type="button"
                      onClick={() =>
                        handleSuggestedUsernameClick(suggestion.username)
                      }
                      className={`group px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 relative
                        ${
                          username === suggestion.username
                            ? 'bg-green-500 text-black shadow-lg shadow-green-500/20 scale-[1.02] font-medium'
                            : isRelatedToSelected
                            ? 'bg-green-900/50 text-white hover:bg-green-800/60 hover:scale-[1.01]'
                            : 'bg-black/50 text-white hover:bg-green-900/40 hover:scale-[1.01] border border-green-500/20'
                        }`}
                    >
                      {suggestion.faviconURL && (
                        <img
                          src={suggestion.faviconURL}
                          alt={suggestion.readableName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <div className="flex flex-col items-start text-left">
                        <span className="text-base font-medium">
                          {suggestion.username}
                        </span>
                        <span className="text-xs opacity-80">
                          from {suggestion.readableName}
                        </span>
                      </div>
                      {hasMultipleNamespaces && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium shadow-lg shadow-black/20 transition-transform group-hover:scale-110">
                          {relatedUsernames.length}
                        </div>
                      )}
                      {hasMultipleNamespaces && (
                        <div className="absolute left-0 right-0 -bottom-1 translate-y-full pt-2 hidden group-hover:block z-10">
                          <div className="bg-black/90 border border-green-800 rounded-lg p-3 shadow-xl">
                            <div className="text-xs text-green-400 mb-2">
                              Available on:
                            </div>
                            <div className="space-y-2">
                              {relatedUsernames.map((related) => (
                                <div
                                  key={related.namespace}
                                  className="flex items-center gap-2"
                                >
                                  {related.faviconURL && (
                                    <img
                                      src={related.faviconURL}
                                      alt={related.readableName}
                                      className="w-4 h-4 rounded-full"
                                    />
                                  )}
                                  <span className="text-xs text-gray-300">
                                    {related.readableName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <SubmitButton
          disabled={!username}
          className="w-full py-4 text-lg font-medium bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-black transition-all duration-200 rounded-lg shadow-lg shadow-green-500/10"
        >
          <span className="relative flex items-center justify-center gap-2">
            Continue
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </SubmitButton>
      </form>
    </div>
  )
}
