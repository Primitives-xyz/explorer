import { Modal } from '../common/modal'
import { Input } from '../form/input'
import { SubmitButton } from '../form/submit-button'
import { Alert } from '../common/alert'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useState } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { DICEBEAR_API_BASE } from '@/lib/constants'
import { Avatar } from '../common/Avatar'

interface UpdateProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsername: string
  currentBio?: string
  currentImage?: string | null
  onProfileUpdated?: () => void
}

export function UpdateProfileModal({
  isOpen,
  onClose,
  currentUsername,
  currentBio = '',
  currentImage,
  onProfileUpdated,
}: UpdateProfileModalProps) {
  const [username, setUsername] = useState(currentUsername)
  const [bio, setBio] = useState(currentBio)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { fileUrl, isUploading, uploadFile } = useFileUpload()
  const { authToken } = useDynamicContext()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await uploadFile(file)
      } catch (err) {
        // Error is handled by the hook
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      setLoading(true)

      const response = await fetch(`/api/profiles/${currentUsername}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username,
          bio,
          image: fileUrl || currentImage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || data.details || 'Failed to update profile',
        )
      }

      onProfileUpdated?.()
      onClose()
    } catch (err: any) {
      console.error('Profile update error:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const validValue = value.toLowerCase().replace(/[^a-z0-9]/g, '')
    setUsername(validValue)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Your Profile">
      <div className="space-y-6">
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
            <label htmlFor="bio" className="block text-sm text-green-500">
              Bio
            </label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              name="bio"
              placeholder="Tell us about yourself"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-green-500">
              Profile Image
            </label>
            <div className="flex items-center gap-4">
              <Avatar
                username={username}
                size={48}
                imageUrl={fileUrl || currentImage}
              />
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*"
                disabled={isUploading}
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
            </div>
            {isUploading && (
              <p className="text-sm text-green-500">Uploading image...</p>
            )}
            {!fileUrl && !currentImage && username && (
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
            )}
          </div>

          <SubmitButton disabled={loading || isUploading}>
            {loading ? 'Updating Profile...' : 'Update Profile'}
          </SubmitButton>
        </form>

        {error && <Alert type="error" message={error} />}
      </div>
    </Modal>
  )
}
