import { IProfile } from '@/components/tapestry/models/profiles.models'
import {
  Button,
  ButtonInputFile,
  ButtonVariant,
  Label,
  useUploadFiles,
} from '@/components/ui'
import { createURL, FetchMethod, fetchWrapper } from '@/utils/api'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { UploadIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'
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
  const t = useTranslations()
  const [uploadLoading, setUploadLoading] = useState(false)
  const { refetch: refetchCurrentUser } = useCurrentWallet()
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
        <div
          className={cn('space-y-4 md:space-y-0', {
            'grid grid-cols-1 md:grid-cols-[160px__1fr] md:gap-8 w-full':
              !!suggestedImages?.length,
            'flex flex-col md:flex-row justify-center':
              !suggestedImages?.length,
          })}
        >
          <div className="flex items-center justify-center md:justify-start md:items-start md:block">
            <div className="w-[160px] space-y-2">
              {!!suggestedImages?.length && (
                <Label>{t('onboarding.form.profile_image.label')}</Label>
              )}
              {mainProfile.image && (
                <div className="bg-muted rounded-lg w-full aspect-square overflow-hidden">
                  <Image
                    src={mainProfile.image}
                    alt={t('onboarding.form.profile_image.alt')}
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
                <UploadIcon size={18} />{' '}
                {t('onboarding.form.profile_image.upload_button')}
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
            className="w-[48%] md:w-[160px]"
            disabled={uploadLoading}
            variant={ButtonVariant.OUTLINE}
          >
            {t('onboarding.buttons.back')}
          </Button>
          <Button
            onClick={() => {
              setStep(EOnboardingSteps.BIO)
            }}
            className="w-[48%] md:w-[160px]"
            loading={uploadLoading}
          >
            {t('onboarding.buttons.next')}
          </Button>
        </div>
      </div>
      {UploadFilesModal}
    </>
  )
}
