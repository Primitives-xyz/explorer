import { IProfile } from '@/components-new-version/models/profiles.models'
import {
  Button,
  ButtonInputFile,
  ButtonVariant,
  Label,
  useUploadFiles,
} from '@/components-new-version/ui'
import { createURL, fetchWrapper } from '@/components-new-version/utils/api'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { cn } from '@/components-new-version/utils/utils'
import { FetchMethod } from '@/utils/api'
import { UploadIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { mutate } from 'swr'
import { useUpdateProfile } from '../../tapestry/hooks/use-update-profile'
import { EOnboardingSteps } from '../onboarding.models'
import { SuggestedImages } from './suggested-images'

interface Props {
  mainProfile: IProfile
  suggestedImages: string[]
  setStep: (step: EOnboardingSteps) => void
}

export function AddProfileImage({
  mainProfile,
  suggestedImages,
  setStep,
}: Props) {
  const { refetch: refetchCurrentUser } = useCurrentWallet()
  const [uploadLoading, setUploadLoading] = useState(false)
  const { updateProfile } = useUpdateProfile({
    username: mainProfile.username,
  })
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
        return
      }

      const filename = files[0]?.name
      const imageUrl = createURL({
        domain: process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL,
        endpoint: filename,
      })

      await updateProfile({
        image: imageUrl,
      })

      refetchCurrentUser()
      mutate((key) => typeof key === 'string' && key.includes('profiles'))

      setUploadLoading(false)
    },
  })

  const onFileChange = (file: File) => {
    setUploadLoading(true)
    uploadFiles([file])
  }

  return (
    <>
      <div className="flex-1 flex flex-col">
        <div
          className={cn({
            'grid grid-cols-[160px__1fr] gap-8 w-full':
              !!suggestedImages?.length,
            'flex justify-center': !suggestedImages?.length,
          })}
        >
          <div>
            <div className="w-[160px] space-y-2">
              {!!suggestedImages?.length && <Label>Profile Image</Label>}
              {mainProfile.image && (
                <div className="bg-muted rounded-lg w-full aspect-square overflow-hidden">
                  <Image
                    src={mainProfile.image}
                    alt="Profile Image"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <ButtonInputFile
                onFileChange={onFileChange}
                disabled={uploadLoading}
                variant={ButtonVariant.OUTLINE}
                containerClassName="mt-3!"
              >
                <UploadIcon size={18} /> Upload Image
              </ButtonInputFile>
            </div>
          </div>
          {!!suggestedImages?.length && (
            <div>
              <SuggestedImages
                suggestedImages={suggestedImages}
                setSuggestedImage={async (imageUrl) => {
                  await updateProfile({
                    image: imageUrl,
                  })
                  refetchCurrentUser()
                }}
              />
            </div>
          )}
        </div>
        <div className="flex justify-between mt-auto">
          <Button
            onClick={() => setStep(EOnboardingSteps.USERNAME)}
            className="w-[160px]"
            disabled={uploadLoading}
            variant={ButtonVariant.OUTLINE}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              setStep(EOnboardingSteps.BIO)
            }}
            className="w-[160px]"
            loading={uploadLoading}
          >
            Next
          </Button>
        </div>
      </div>
      {UploadFilesModal}
    </>
  )
}
