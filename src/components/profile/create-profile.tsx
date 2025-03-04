'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Alert } from '@/components/common/alert'
import { Modal } from '@/components/common/modal'
import { useIdentities } from '@/hooks/use-identities'
import { useProfileCreation } from '@/hooks/use-profile-creation'
import { useProfileForm } from '@/hooks/use-profile-form'
import { useProfileModalVisibility } from '@/hooks/use-profile-modal-visibility'
import { useSuggestedProfileData } from '@/hooks/use-suggested-profile-data'
import { DetailsStep } from './details-step'
import { UsernameStep } from './username-step'

export function CreateProfile({
  onProfileCreated,
  forceOpen,
}: {
  onProfileCreated?: () => void
  forceOpen?: boolean
}) {
  const { walletAddress, mainUsername, loadingProfiles, profiles } =
    useCurrentWallet()

  // Get suggested usernames from identities
  const { identities: suggestedProfiles, loading: loadingSuggestions } =
    useIdentities(walletAddress || '')

  // Profile creation logic
  const {
    loading,
    error,
    response,
    createProfile,
    updateProfileSetupModalShownStatus,
  } = useProfileCreation({
    walletAddress,
    onProfileCreated,
  })

  // Modal visibility logic
  const { isModalOpen, setIsModalOpen } = useProfileModalVisibility({
    walletAddress,
    mainUsername,
    loadingProfiles,
    profiles,
    forceOpen,
    updateProfileSetupModalShownStatus,
  })

  // Form state management
  const {
    username,
    bio,
    currentStep,
    selectedImageUrl,
    fileUrl,
    isUploadingImage,
    handleInputChange,
    handleSuggestedUsernameClick,
    handleImageSelect,
    handleFileSelect,
    setCurrentStep,
    setBio,
  } = useProfileForm()

  // Suggested profile data
  const {
    suggestedUsernames,
    usernameGroups,
    suggestedImages,
    suggestedBios,
    loadingNFTs,
  } = useSuggestedProfileData({
    suggestedProfiles,
    loadingSuggestions,
    walletAddress,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentStep === 'username') {
      if (username) {
        setCurrentStep('details')
      }
      return
    }

    if (walletAddress && username) {
      const imageUrl = selectedImageUrl || fileUrl
      const success = await createProfile(username, bio, imageUrl)

      // Redirect to onboarding page after successful profile creation
      if (success) {
        // Add a small delay to ensure all states are updated
        setTimeout(() => {
          window.location.href = '/onboarding'
        }, 50)
      }
    }
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
      className="w-full max-h-[95vh] overflow-y-auto max-w-3xl mx-auto"
    >
      <div className="space-y-6">
        {currentStep === 'username' ? (
          <UsernameStep
            username={username}
            handleInputChange={handleInputChange}
            handleSuggestedUsernameClick={handleSuggestedUsernameClick}
            suggestedUsernames={suggestedUsernames}
            usernameGroups={usernameGroups}
            loadingSuggestions={loadingSuggestions}
            onSubmit={handleSubmit}
          />
        ) : (
          <DetailsStep
            username={username}
            bio={bio}
            setBio={setBio}
            selectedImageUrl={selectedImageUrl}
            fileUrl={fileUrl}
            isUploadingImage={isUploadingImage}
            suggestedBios={suggestedBios}
            suggestedImages={suggestedImages}
            handleImageSelect={handleImageSelect}
            handleFileSelect={handleFileSelect}
            onBack={() => setCurrentStep('username')}
            onSubmit={handleSubmit}
            loading={loading}
            loadingNFTs={loadingNFTs}
          />
        )}

        {error && <Alert type="error" message={error} />}
        {response && (
          <Alert type="success" message="Profile created successfully!" />
        )}
      </div>
    </Modal>
  )
}
