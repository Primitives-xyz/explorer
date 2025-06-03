'use client'

import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { useUploadFiles } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { createURL, FetchMethod, fetchWrapper } from '@/utils/api'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { Camera } from 'lucide-react'
import { useState } from 'react'

interface ProfileImageEditorProps {
  username: string
  imageUrl?: string | null
  isOwnProfile: boolean
  size?: number
  className?: string
}

export function ProfileImageEditor({
  username,
  imageUrl,
  isOwnProfile,
  size = 72,
  className = '',
}: ProfileImageEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const { updateProfile } = useUpdateProfile({ username })
  const { refetch: refetchCurrentUser } = useCurrentWallet()

  const { uploadFiles, UploadFilesModal } = useUploadFiles({
    getUploadUrl: async (file: File) => {
      const response = await fetchWrapper<{ postUrl: string }>({
        method: FetchMethod.POST,
        endpoint: `upload/${file.name}`,
      })
      return response.postUrl
    },
    onSuccess: async (files: File[]) => {
      if (!process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL) {
        console.error('Missing env var NEXT_PUBLIC_TAPESTRY_ASSETS_URL')
        setUploadingImage(false)
        return
      }

      const filename = files[0]?.name
      const imageUrl = createURL({
        domain: process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL,
        endpoint: filename,
      })

      try {
        await updateProfile({ image: imageUrl })
        await refetchCurrentUser()
      } catch (error) {
        console.error('Failed to update profile image:', error)
      } finally {
        setUploadingImage(false)
      }
    },
  })

  const handleImageEdit = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setUploadingImage(true)
        uploadFiles([file])
      }
    }
    input.click()
  }

  return (
    <>
      <div className={`relative group ${className}`}>
        <Avatar
          username={username}
          imageUrl={imageUrl}
          className="w-18 h-18 aspect-square"
          size={size}
        />
        {isOwnProfile && (
          <button
            onClick={handleImageEdit}
            disabled={uploadingImage}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            title="Change profile picture"
          >
            {uploadingImage ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={20} className="text-white" />
            )}
          </button>
        )}
      </div>
      {UploadFilesModal}
    </>
  )
}
