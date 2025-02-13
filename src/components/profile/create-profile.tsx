'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import {
  refreshProfiles,
  useGetProfiles,
} from '@/components/auth/hooks/use-get-profiles'
import { Alert } from '@/components/common/alert'
import { Modal } from '@/components/common/modal'
import { Input } from '@/components/form/input'
import { SubmitButton } from '@/components/form/submit-button'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useEffect, useState } from 'react'
import { DICEBEAR_API_BASE } from '@/lib/constants'
import { useFileUpload } from '@/hooks/use-file-upload'
import { cn } from '@/lib/utils'
import type { IGetProfilesResponse } from '@/models/profile.models'

type FormStep = 'username' | 'details'

interface SuggestedProfile {
  profile?: {
    username?: string
    namespace?: string
    image?: string | null
    bio?: string
  }
  namespace?: {
    name: string
    readableName: string
    faviconURL?: string | null
  }
}

interface SuggestedUsername {
  username: string
  namespace: string
  readableName: string
  faviconURL?: string | null
  image?: string | null
}

const MAX_DAYS_SHOW_UPDATE_PROFILE_MODAL = 5;

export function CreateProfile({
  onProfileCreated,
}: {
  onProfileCreated?: () => void
}) {
  const { walletAddress, mainUsername, loadingProfiles, profiles } = useCurrentWallet()
  const [username, setUsername] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<any | null>(null)
  const { authToken } = useDynamicContext()
  const { fileUrl, isUploading: isUploadingImage, uploadFile } = useFileUpload()
  const [currentStep, setCurrentStep] = useState<FormStep>('username')
  const [bio, setBio] = useState('')
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')

  // Get suggested usernames from identities
  const { profiles: suggestedProfiles, loading: loadingSuggestions } =
    useGetProfiles(
      walletAddress || '',
      true, // useIdentities = true
    )

  // Group usernames by their base name to find duplicates
  const usernameGroups = ((suggestedProfiles || []) as SuggestedProfile[])
    .map((profile) => {
      if (
        profile.profile?.username &&
        profile.profile?.namespace &&
        profile.namespace
      ) {
        return {
          username: profile.profile.username,
          namespace: profile.profile.namespace,
          readableName: profile.namespace.readableName,
          faviconURL: profile.namespace.faviconURL || null,
          image: profile.profile.image,
        } as SuggestedUsername
      }
      return null
    })
    .filter((item): item is SuggestedUsername => item !== null)
    .reduce((groups, profile) => {
      const group = groups.get(profile.username) || []
      group.push(profile)
      groups.set(profile.username, group)
      return groups
    }, new Map<string, SuggestedUsername[]>())

  // Create array of unique usernames, using the first occurrence's details
  const suggestedUsernames = Array.from(usernameGroups.entries())
    .sort(([_, profilesA], [__, profilesB]) => {
      // Sort by number of profiles in descending order
      return profilesB.length - profilesA.length
    })
    .map(([_, profiles]) => profiles[0])
    .filter((profile): profile is SuggestedUsername => !!profile)

  // Get unique suggested profile images
  const suggestedImages = Array.from(
    new Set(
      suggestedUsernames
        .map((profile) => profile.image)
        .filter((image): image is string => !!image),
    ),
  )

  // Get unique suggested bios from all profiles
  const suggestedBios = Array.from(
    new Set(
      ((suggestedProfiles || []) as SuggestedProfile[])
        .map((profile) => profile.profile?.bio)
        .filter(
          (bio): bio is string =>
            !!bio &&
            bio.trim() !== '' &&
            !bio.toLowerCase().includes('highest score'),
        ),
    ),
  )
  const updateProfileSetupModalShownStatus = async (walletAddress: string) => {
    try {
      const response = await fetch(`api/profiles/${walletAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          username: walletAddress,
          properties: [{
            key: 'hasSeenProfileSetupModal', value: true
          }]
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || data.details || 'Failed to update profile',
        )
     } 
    } catch (error) {
      console.error('Failed to update modal count:', error);
      // Optionally handle the error
    }
};

  const isProfileSetup =  () => {
    const MODAL_CREATE_PROFILE_PREFIX = 'create_profile_modal_'

    const profile = profiles.find((profile: IGetProfilesResponse) => {
      return profile.namespace.name == 'nemoapp' && profile.profile.username === mainUsername
    })

    if(profile?.profile.hasSeenProfileSetupModal) return true
    if (mainUsername === walletAddress || mainUsername=='bcahjidbuwzhqic7ajnnlcqf') {
      const initialTimestamp = localStorage.getItem(`${MODAL_CREATE_PROFILE_PREFIX}${walletAddress}`);
      const currentTime = Date.now();
      
      // If this is the first time showing the modal, set the initial timestamp
      if (!initialTimestamp) {
        localStorage.setItem(`${MODAL_CREATE_PROFILE_PREFIX}${walletAddress}`, currentTime.toString());
        return false;
      }
      
      // Calculate the difference in days
      const daysSinceFirstShow = (currentTime - parseInt(initialTimestamp)) / (1000 * 60 * 60 * 24);
      
      // If it's been more than 5 days, update the backend and stop showing the modal
      if (daysSinceFirstShow > MAX_DAYS_SHOW_UPDATE_PROFILE_MODAL) {
        void updateProfileSetupModalShownStatus(mainUsername); // asynchronously update the backend
        return true; 
      }
      return false;
    }
    return true;
  }

  // For testing purposes, we'll show the modal whenever wallet is connected
  const shouldShowModal = !!walletAddress && !loadingProfiles && !isProfileSetup()

  useEffect(() => {
    setIsModalOpen(shouldShowModal)
  }, [shouldShowModal])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const uploadedUrl = await uploadFile(file)
        setSelectedImageUrl(uploadedUrl)
      } catch (err) {
        console.error('Error uploading file:', err)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentStep === 'username') {
      if (username) {
        setCurrentStep('details')
      }
      return
    }

    if (walletAddress && username) {
      try {
        setError(null)
        setLoading(true)
        setResponse(null)

        const imageUrl =
          selectedImageUrl ||
          fileUrl ||
          `${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`

        const response = await fetch('/api/profiles/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            username,
            ownerWalletAddress: walletAddress,
            profileImageUrl: imageUrl,
            bio,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || data.details || 'Failed to create profile',
          )
        }

        setResponse(data)
        await refreshProfiles(walletAddress)
        setIsModalOpen(false)
        onProfileCreated?.()
      } catch (err: any) {
        console.error('Profile creation error:', err)
        setError(err.message || 'Failed to create profile')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const validValue = value.toLowerCase().replace(/[^a-z0-9]/g, '')
    setUsername(validValue)
  }
  const handleSuggestedUsernameClick = (suggestedUsername: string) => {
    setUsername(suggestedUsername)
  }

  
  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl)
  }

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={
        currentStep === 'username'
          ? 'Choose Your Username'
          : 'Complete Your Profile'
      }
      className="w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="relative">
        <div className="absolute -top-14 left-0 right-0 text-center">
          <div className="inline-block bg-green-500 text-black px-4 py-1.5 rounded-full text-sm font-medium">
            Create your profile to get started
          </div>
        </div>
        <div className="space-y-6">
          {currentStep === 'username' ? (
            <>
              <p className="text-green-400/80 text-lg md:text-xl">
                Choose a unique username for your profile. You can pick from
                suggested usernames or create your own.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label
                    htmlFor="username"
                    className="block text-sm md:text-base text-green-500"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={handleInputChange}
                    name="username"
                    placeholder="Enter username (letters and numbers only)"
                    className="w-full text-lg"
                  />
                  <p className="text-xs md:text-sm text-green-600">
                    Only lowercase letters and numbers are allowed
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm md:text-base text-green-500">
                    Suggested Usernames
                  </label>
                  {loadingSuggestions ? (
                    <div className="p-4 flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      <div className="text-green-600 font-mono animate-pulse">
                        {'>>> LOADING SUGGESTIONS...'}
                      </div>
                    </div>
                  ) : suggestedUsernames.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5 max-h-48 overflow-y-auto p-2 -mx-2">
                      {suggestedUsernames.map((suggestion) => {
                        const relatedUsernames =
                          usernameGroups.get(suggestion.username) || []
                        const hasMultipleNamespaces =
                          relatedUsernames.length > 1
                        const isRelatedToSelected =
                          username &&
                          relatedUsernames.some(
                            (related) => related.username === username,
                          )

                        return (
                          <button
                            key={`${suggestion.namespace}-${suggestion.username}`}
                            type="button"
                            onClick={() =>
                              handleSuggestedUsernameClick(suggestion.username)
                            }
                            className={`group px-4 py-2 text-sm md:text-base rounded-full transition-colors flex items-center gap-2.5 relative
                              ${
                                username === suggestion.username
                                  ? 'bg-green-500 text-black'
                                  : isRelatedToSelected
                                  ? 'bg-green-900/50 text-green-400 hover:bg-green-900/60'
                                  : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                              }`}
                          >
                            {suggestion.faviconURL && (
                              <img
                                src={suggestion.faviconURL}
                                alt={suggestion.readableName}
                                className="w-5 h-5 md:w-6 md:h-6 rounded-full"
                              />
                            )}
                            <span className="text-base md:text-lg">
                              {suggestion.username}
                            </span>
                            <span className="text-xs md:text-sm opacity-60 border-l border-current pl-2">
                              from {suggestion.readableName}
                            </span>
                            {hasMultipleNamespaces && (
                              <div className="absolute -top-2 -right-2 bg-green-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium shadow-lg shadow-black/20 transition-transform group-hover:scale-110">
                                {relatedUsernames.length}
                              </div>
                            )}
                            {hasMultipleNamespaces && (
                              <div className="absolute left-0 right-0 -bottom-1 translate-y-full pt-2 hidden group-hover:block z-10">
                                <div className="bg-black/90 border border-green-800 rounded-lg p-2 shadow-xl">
                                  <div className="text-xs text-green-400 mb-1.5">
                                    Available on:
                                  </div>
                                  <div className="space-y-1.5">
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
                                        <span className="text-green-300 text-xs">
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
                  ) : null}
                </div>

                <SubmitButton
                  disabled={!username}
                  className="w-full py-3 text-lg font-medium bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-black transition-colors relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/20 to-green-400/0 group-hover:via-green-400/30 animate-shine" />
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
            </>
          ) : (
            <>
              <p className="text-green-400/80 text-lg md:text-xl">
                Add more details to your profile. You can add a bio and upload a
                profile image.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label
                      htmlFor="bio"
                      className="block text-sm md:text-base text-green-500"
                    >
                      Bio (Optional)
                    </label>
                    <Input
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      name="bio"
                      placeholder="Tell us about yourself"
                      className="w-full text-lg"
                    />
                    {suggestedBios.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-green-400/80">
                            Suggested Bios
                          </p>
                          <p className="text-xs text-green-600">
                            {suggestedBios.length} available
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                          {suggestedBios.map((suggestedBio, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setBio(suggestedBio)}
                              className={`text-left p-2.5 rounded-lg transition-colors text-sm group relative
                                ${
                                  bio === suggestedBio
                                    ? 'bg-green-500 text-black'
                                    : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                }`}
                            >
                              <div className="line-clamp-2">{suggestedBio}</div>
                              {suggestedBio.length > 150 && (
                                <div className="absolute left-0 right-0 -bottom-1 translate-y-full pt-2 hidden group-hover:block z-10">
                                  <div className="bg-black/90 border border-green-800 rounded-lg p-2 shadow-xl">
                                    <div className="text-green-300 text-xs">
                                      {suggestedBio}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm md:text-base text-green-500">
                      Profile Image (Optional)
                    </label>

                    <div className="space-y-2">
                      {suggestedImages.length > 0 ? (
                        <>
                          <p className="text-sm text-green-400/80">
                            Suggested Images
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {suggestedImages.map((imageUrl) => (
                              <button
                                key={imageUrl}
                                type="button"
                                onClick={() => handleImageSelect(imageUrl)}
                                className={cn(
                                  'relative group rounded-full overflow-hidden border-2 transition-all duration-200',
                                  selectedImageUrl === imageUrl
                                    ? 'border-green-500 ring-2 ring-green-500/20'
                                    : 'border-green-500/20 hover:border-green-500/50',
                                )}
                              >
                                <img
                                  src={imageUrl}
                                  alt="Suggested profile"
                                  className="w-16 h-16 md:w-20 md:h-20 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-green-400">
                                    Select
                                  </span>
                                </div>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                handleImageSelect(
                                  `${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`,
                                )
                              }
                              className={cn(
                                'relative group rounded-full overflow-hidden border-2 transition-all duration-200',
                                selectedImageUrl ===
                                  `${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`
                                  ? 'border-green-500 ring-2 ring-green-500/20'
                                  : 'border-green-500/20 hover:border-green-500/50',
                              )}
                            >
                              <img
                                src={`${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`}
                                alt="Default avatar"
                                className="w-16 h-16 md:w-20 md:h-20 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-green-400">
                                  Default Avatar
                                </span>
                              </div>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleImageSelect(
                                `${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`,
                              )
                            }
                            className={cn(
                              'relative group rounded-full overflow-hidden border-2 transition-all duration-200',
                              selectedImageUrl ===
                                `${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`
                                ? 'border-green-500 ring-2 ring-green-500/20'
                                : 'border-green-500/20 hover:border-green-500/50',
                            )}
                          >
                            <img
                              src={`${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`}
                              alt="Generated avatar"
                              className="w-16 h-16 md:w-20 md:h-20 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-green-400">
                                Use Generated Avatar
                              </span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-green-500/20"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 text-xs text-green-500 bg-black/90">
                          OR UPLOAD YOUR OWN
                        </span>
                      </div>
                    </div>

                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*"
                      disabled={isUploadingImage}
                      className="block w-full text-sm md:text-base text-green-400
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-900/30 file:text-green-400
                        hover:file:bg-green-900/50
                        file:cursor-pointer file:transition-colors
                        file:border-green-500
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {isUploadingImage && (
                      <p className="text-sm md:text-base text-green-500">
                        Uploading image...
                      </p>
                    )}
                    {(selectedImageUrl || fileUrl) && (
                      <div className="mt-4">
                        <p className="text-sm text-green-400/80 mb-2">
                          Preview
                        </p>
                        <img
                          src={selectedImageUrl || fileUrl}
                          alt="Profile preview"
                          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-green-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('username')}
                    className="px-6 py-3 text-base md:text-lg font-medium text-green-400 bg-green-900/30 
                      hover:bg-green-900/50 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <SubmitButton
                    disabled={loading || isUploadingImage}
                    className="flex-1 py-3 text-lg font-medium bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-black transition-colors relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/20 to-green-400/0 group-hover:via-green-400/30 animate-shine" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Creating Profile...
                        </>
                      ) : (
                        <>
                          Create Profile
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 2a.75.75 0 01.75.75v12.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V2.75A.75.75 0 0110 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </span>
                  </SubmitButton>
                </div>
              </form>
            </>
          )}

          {error && <Alert type="error" message={error} />}
          {response && (
            <Alert type="success" message="Profile created successfully!" />
          )}
        </div>
      </div>
    </Modal>
  )
}
