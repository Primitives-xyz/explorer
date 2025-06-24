'use client'

import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import {
  IProfile,
  ISuggestedUsername,
} from '@/components/tapestry/models/profiles.models'
import {
  Button,
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
import { cn } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { EOnboardingSteps } from '../../onboarding.models'
import { SuggestedUsernames } from '../suggested-usernames'

// Acceptable SNS suffixes
const ACCEPTABLE_SUFFIXES = ['.sol']

interface Props {
  suggestedUsernames: ISuggestedUsername[]
  mainProfile: IProfile
  setStep: (step: EOnboardingSteps) => void
}

export function UpdateUsernameForm({
  suggestedUsernames,
  mainProfile,
  setStep,
}: Props) {
  const t = useTranslations()
  const [suggestedUsername, setSuggestedUsername] =
    useState<ISuggestedUsername>()
  const { updateProfile, loading } = useUpdateProfile({
    profileId: mainProfile.id,
  })
  const { refetch: refetchCurrentUser } = useCurrentWallet()

  const formSchema = z.object({
    username: z
      .string()
      .min(3, { message: t('onboarding.form.username.validation.min_length') })
      .max(30, { message: t('onboarding.form.username.validation.max_length') })
      .regex(/^[a-zA-Z0-9_.]+$/, {
        message: t('onboarding.form.username.validation.format'),
      })
      .refine(
        (username) => {
          // Check if username contains a period
          if (username.includes('.')) {
            // Check if it ends with an acceptable suffix
            return ACCEPTABLE_SUFFIXES.some((suffix) =>
              username.endsWith(suffix)
            )
          }
          // If no period, it's valid
          return true
        },
        {
          message: `Usernames with periods must end with one of: ${ACCEPTABLE_SUFFIXES.join(
            ', '
          )}`,
        }
      )
      .refine(
        (username) => {
          // Ensure username doesn't start or end with period (unless it's a valid suffix)
          if (username.startsWith('.')) return false
          if (
            username.endsWith('.') &&
            !ACCEPTABLE_SUFFIXES.some((suffix) => username.endsWith(suffix))
          ) {
            return false
          }
          // Ensure no consecutive periods
          return !username.includes('..')
        },
        {
          message: 'Invalid username format',
        }
      ),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: mainProfile?.username ?? '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateProfile({
        username: values.username,
      })

      refetchCurrentUser()
      setStep(EOnboardingSteps.IMAGE)

      // form.reset()
    } catch (error: any) {
      // console.error('Error', error)
      form.setError('username', {
        type: 'manual',
        message: error.message ?? 'Error creating profile. Please try again.',
      })
    }
  }

  useEffect(() => {
    if (suggestedUsername) {
      form.setValue('username', suggestedUsername.username)
    }
  }, [suggestedUsername, form])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 flex flex-col"
      >
        <div
          className={cn('space-y-4 md:space-y-0', {
            'grid grid-cols-1 md:grid-cols-5 md:gap-8':
              !!suggestedUsernames?.length,
            'flex flex-col md:flex-row justify-center':
              !suggestedUsernames?.length,
          })}
        >
          <div
            className={cn({
              'col-span-2': !!suggestedUsernames?.length,
              'w-full md:w-[350px]': !suggestedUsernames?.length,
            })}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <Label>{t('onboarding.form.username.label')}</Label>
                  <FormControl>
                    <Input
                      placeholder={t('onboarding.form.username.placeholder')}
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
          </div>
          {!!suggestedUsernames?.length && (
            <div className="col-span-3">
              <SuggestedUsernames
                suggestedUsernames={suggestedUsernames}
                suggestedUsername={suggestedUsername}
                setSuggestedUsername={setSuggestedUsername}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-auto">
          <Button
            type="submit"
            className="w-[48%] md:w-[160px]"
            loading={loading}
          >
            {t('onboarding.buttons.next')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
