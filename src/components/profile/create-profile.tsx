'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Alert } from '@/components/common/alert'
import { Modal } from '@/components/common/modal'
import { Input } from '@/components/form/input'
import { SubmitButton } from '@/components/form/submit-button'
import { useEffect, useState } from 'react'

export function CreateProfile() {
  const { walletAddress, mainUsername } = useCurrentWallet()
  const [username, setUsername] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<any | null>(null)
  const [hasCheckedUsername, setHasCheckedUsername] = useState(false)

  useEffect(() => {
    // Only update modal state after we've confirmed username status
    if (walletAddress) {
      if (mainUsername === null || mainUsername === undefined) {
        // Still loading username status
        return
      }
      setHasCheckedUsername(true)
      setIsModalOpen(!mainUsername)
    } else {
      setHasCheckedUsername(false)
      setIsModalOpen(false)
    }
  }, [walletAddress, mainUsername])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (walletAddress && username) {
      try {
        setError(null)
        setLoading(true)
        setResponse(null)

        const response = await fetch('/api/profiles/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            ownerWalletAddress: walletAddress,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || data.details || 'Failed to create profile',
          )
        }

        setResponse(data)
        setIsModalOpen(false)
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

  if (!walletAddress || mainUsername) return null

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Welcome! Let's Create Your Profile"
    >
      <div className="space-y-6">
        <p className="text-green-400/80">
          Choose a unique username for your profile. This will be your identity
          in the app.
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

          <SubmitButton disabled={loading}>
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
