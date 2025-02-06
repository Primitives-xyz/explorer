'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { refreshProfiles } from '@/components/auth/hooks/use-get-profiles'
import { Alert } from '@/components/common/alert'
import { Modal } from '@/components/common/modal'
import { Input } from '@/components/form/input'
import { SubmitButton } from '@/components/form/submit-button'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useEffect, useState } from 'react'
import { DICEBEAR_API_BASE } from '@/lib/constants'
import { createURL } from '@/lib/utils'
export function CreateProfile({
  onProfileCreated,
}: {
  onProfileCreated?: () => void
}) {
  const { walletAddress, mainUsername, loadingProfiles } = useCurrentWallet()
  const hasProfile = !!mainUsername
  const [username, setUsername] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<any | null>(null)
  const { authToken } = useDynamicContext()
  const [fileUrl, setFileUrl] = useState<string>('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    // Only show modal if we have a wallet connected, no profile, and is a holder
    if (walletAddress && !loadingProfiles) {
      setIsModalOpen(!hasProfile)
    } else {
      setIsModalOpen(false)
    }
  }, [walletAddress, hasProfile, loadingProfiles])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await getUploadUrl(file)
    }
  }

  const getUploadUrl = async (file: File) => {
    try {
      setIsUploadingImage(true)
      setError(null)

      const endpoint = `/api/upload/${encodeURIComponent(file.name)}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get upload URL')
      }

      if (!data.postUrl) {
        throw new Error('No upload URL returned from server')
      }

      // Upload the file
      const uploadResponse = await fetch(data.postUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        const uploadErrorText = await uploadResponse
          .text()
          .catch(() => 'No error text available')
        throw new Error(`Failed to upload image: ${uploadErrorText}`)
      }

      // Extract the path from the pre-signed URL
      const url = new URL(data.postUrl)
      const filePath = url.pathname.split('?')[0] // Remove query parameters

      // Construct the final file URL
      const finalFileUrl = createURL({
        domain: process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL || '',
        endpoint: filePath || '',
      })

      setFileUrl(finalFileUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (walletAddress && username) {
      try {
        setError(null)
        setLoading(true)
        setResponse(null)

        // Use uploaded image URL if available, otherwise use Dicebear
        const imageUrl =
          fileUrl || `${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`

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
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || data.details || 'Failed to create profile',
          )
        }

        setResponse(data)
        // Refresh profiles after successful creation
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

  // Only render if we have a wallet connected, no profile, and is a holder
  if (!walletAddress || hasProfile) return null

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Welcome! Let's Create Your Profile"
    >
      <div className="space-y-6">
        <p className="text-green-400/80">
          Choose a unique username and optionally upload a profile image. If no
          image is uploaded, we'll generate one for you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm text-green-500">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={handleInputChange}
              name="username"
              placeholder="Enter username (letters and numbers only)"
              className="w-full"
            />
            <p className="text-xs text-green-600">
              Only lowercase letters and numbers are allowed
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-green-500">
              Profile Image (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              accept="image/*"
              disabled={isUploadingImage}
              className="block w-full text-sm text-green-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-900/30 file:text-green-400
                hover:file:bg-green-900/50
                file:cursor-pointer file:transition-colors
                file:border file:border-green-500
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isUploadingImage && (
              <p className="text-sm text-green-500">Uploading image...</p>
            )}
            {fileUrl ? (
              <div className="mt-2">
                <img
                  src={fileUrl}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                />
              </div>
            ) : (
              username && (
                <div className="mt-2">
                  <img
                    src={`${DICEBEAR_API_BASE}/shapes/svg?seed=${username}`}
                    alt="Default avatar preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-green-500/50"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    This will be your default avatar if no image is uploaded
                  </p>
                </div>
              )
            )}
          </div>

          <SubmitButton disabled={loading || isUploadingImage}>
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </SubmitButton>
        </form>

        {error && <Alert type="error" message={error} />}
        {response && (
          <Alert type="success" message="Profile created successfully!" />
        )}
      </div>
    </Modal>
  )
}
