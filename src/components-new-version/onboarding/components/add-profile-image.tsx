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
import { FetchMethod } from '@/utils/api'
import { UploadIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useUpdateProfile } from '../hooks/use-update-profile'
import { SuggestedImages } from './suggested-images'

interface Props {
  mainProfile: IProfile
  setStep: (step: number) => void
  walletAddress: string
}

export function AddProfileImage({
  mainProfile,
  setStep,
  walletAddress,
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
        <div className="grid grid-cols-5 gap-8 w-full">
          <div className="col-span-2">
            <div className="w-[160px] space-y-2">
              <Label>Profile Image</Label>
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
                containerClassName="!mt-3"
              >
                <UploadIcon size={18} /> Upload Image
              </ButtonInputFile>
            </div>
          </div>
          <div className="col-span-3">
            <SuggestedImages
              walletAddress={walletAddress}
              setSuggestedImage={async (imageUrl) => {
                await updateProfile({
                  image: imageUrl,
                })
                refetchCurrentUser()
              }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-auto">
          <Button
            onClick={() => setStep(1)}
            className="w-[160px]"
            disabled={uploadLoading}
            variant={ButtonVariant.OUTLINE}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              setStep(3)
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
