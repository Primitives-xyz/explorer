'use client'

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
} from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { EPudgyOnboardingStep } from '../pudgy.models'
import { PudgyAvatarFrameSelection } from './pudgy-avatar-frame-selection'
import { PudgyThemeSelection } from './pudgy-theme-selection'

interface Props {
  setStep: (step: EPudgyOnboardingStep) => void
}

export function PudgyClaimProfileStep({ setStep }: Props) {
  const t = useTranslations()
  const { mainProfile } = useCurrentWallet()

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
      username: mainProfile?.username,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // try {
    //   await createProfile({
    //     username: values.username,
    //     ownerWalletAddress: walletAddress,
    //   })
    //   refetchCurrentUser()
    //   setStep(EOnboardingSteps.IMAGE)
    //   // form.reset()
    // } catch (error: any) {
    //   // console.error('Error', error)
    //   form.setError('username', {
    //     type: 'manual',
    //     message: error.message ?? 'Error creating profile. Please try again.',
    //   })
    // }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 flex flex-col"
      >
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-2">
            <PudgyAvatarFrameSelection />
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
            <PudgyThemeSelection />
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
            <Button
              onClick={() => setStep(EPudgyOnboardingStep.CLAIM)}
              className="w-[160px]"
            >
              Burn PENGU
            </Button>
            <p className="text-xs text-primary absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-2">
              -123 PENGU
            </p>
          </div>
        </div>
      </form>
    </Form>
  )
}
