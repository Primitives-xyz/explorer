'use client'

import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import {
  Button,
  ButtonVariant,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Label,
  Spinner,
} from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { usePudgyPayment } from '../hooks/use-pudgy-payment'
import { ECryptoTransactionStatus } from '../pudgy-payment.models'
import { EPudgyOnboardingStep, EPudgyTheme } from '../pudgy.models'
import { PudgyAvatarFrameSelection } from './pudgy-avatar-frame-selection'
import { PudgyThemeSelection } from './pudgy-theme-selection'

interface Props {
  setStep: (step: EPudgyOnboardingStep) => void
  mainProfile: IProfile
}

export function PudgyClaimProfileStep({ setStep, mainProfile }: Props) {
  const t = useTranslations()
  const { refetch: refetchCurrentUser } = useCurrentWallet()
  const {
    paymentDetailsData,
    transactionStatusData,
    loading: pudgyPaymentLoading,
    error: pudgyPaymentError,
    pay,
  } = usePudgyPayment({
    profileId: mainProfile.id,
  })
  const {
    updateProfile,
    loading: updateProfileLoading,
    error: updateProfileError,
  } = useUpdateProfile({
    profileId: mainProfile.id,
  })
  const [pudgyTheme, setPudgyTheme] = useState(EPudgyTheme.DEFAULT)
  const [pudgyFrame, setPudgyFrame] = useState(true)
  const { push } = useRouter()

  const loading = pudgyPaymentLoading || updateProfileLoading
  const error = pudgyPaymentError || updateProfileError

  const formSchema = z.object({
    username: z
      .string()
      .min(3, { message: t('onboarding.form.username.validation.min_length') })
      .max(30, { message: t('onboarding.form.username.validation.max_length') })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: t('onboarding.form.username.validation.format'),
      }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: mainProfile.username,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateProfile({
      username: values.username,
    })
    await refetchCurrentUser()
    pay()
  }

  useEffect(() => {
    const updatePudgyProfile = async () => {
      await updateProfile({
        username: form.getValues('username'),
        properties: [
          {
            key: 'pudgyTheme',
            value: pudgyTheme,
          },
          {
            key: 'pudgyFrame',
            value: pudgyFrame,
          },
        ],
      })
      refetchCurrentUser()
      push(
        route('entity', {
          id: mainProfile.id,
        })
      )
    }

    if (transactionStatusData?.status === ECryptoTransactionStatus.COMPLETED) {
      updatePudgyProfile()
    }
  }, [
    transactionStatusData,
    updateProfile,
    form,
    pudgyTheme,
    pudgyFrame,
    mainProfile.id,
    push,
    refetchCurrentUser,
  ])

  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 flex flex-col"
      >
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-2">
            <PudgyAvatarFrameSelection
              displayPudgyFrame={pudgyFrame}
              setDisplayPudgyFrame={setPudgyFrame}
              pudgyTheme={pudgyTheme}
            />
          </div>
          <div className="col-span-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <Label>{t('onboarding.form.username.label')}</Label>
                  <FormControl>
                    <Input
                      placeholder={t('onboarding.form.username.placeholder')}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('onboarding.form.username.description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <PudgyThemeSelection
              selectedTheme={pudgyTheme}
              setSelectedTheme={setPudgyTheme}
            />
          </div>
        </div>
        <div className="flex justify-between mt-auto">
          <Button
            className="w-[160px]"
            onClick={() => {
              setStep(EPudgyOnboardingStep.INTRO)
            }}
            variant={ButtonVariant.OUTLINE}
          >
            {t('onboarding.buttons.back')}
          </Button>
          <div className="relative">
            <Button className="w-[160px]" disabled={loading} type="submit">
              {loading ? (
                <Spinner />
              ) : (
                <>Burn {paymentDetailsData?.tokenSymbol}</>
              )}
            </Button>
            {!!paymentDetailsData && (
              <p className="text-xs text-primary absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-2 w-full text-center">
                -{paymentDetailsData.amount} {paymentDetailsData.tokenSymbol}
              </p>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
