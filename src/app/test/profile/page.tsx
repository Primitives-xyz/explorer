'use client'

import { useState } from 'react'
import { TestCreateProfile } from './test-create-profile'

export default function TestProfilePage() {
  const [profileCreated, setProfileCreated] = useState(false)
  const [forceOpen, setForceOpen] = useState(true)

  const handleProfileCreated = () => {
    setProfileCreated(true)
    setForceOpen(false)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Creation Test Page</h1>

      <div className="bg-[#1A1D21] p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setForceOpen(true)}
            className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors"
          >
            Show Profile Modal
          </button>
          <button
            onClick={() => setProfileCreated(false)}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Reset Profile Created Status
          </button>
        </div>
      </div>

      <div className="bg-[#1A1D21] p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <div className="space-y-2">
          <p>
            Force Modal Open:{' '}
            <span className="font-mono">{forceOpen ? 'true' : 'false'}</span>
          </p>
          <p>
            Profile Created:{' '}
            <span className="font-mono">
              {profileCreated ? 'true' : 'false'}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-[#1A1D21] p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Component</h2>
        <TestCreateProfile
          onProfileCreated={handleProfileCreated}
          forceOpen={forceOpen}
        />
      </div>
    </div>
  )
}
