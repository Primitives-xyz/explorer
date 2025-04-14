'use client'

import { ISuggestedUsername } from '@/components/models/profiles.models'
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
import { cn } from '@/utils/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateProfile } from '../../tapestry/hooks/use-create-profile'
import { EOnboardingSteps } from '../onboarding.models'
import { SuggestedUsernames } from './suggested-usernames'

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(30, { message: 'Username must not exceed 30 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores',
    }),
})

interface Props {
  walletAddress: string
  suggestedUsernames: ISuggestedUsername[]
  setStep: (step: EOnboardingSteps) => void
  closeModal: () => void
}

export function CreateUsernameForm({
  walletAddress,
  suggestedUsernames,
  setStep,
  closeModal,
}: Props) {
  const [suggestedUsername, setSuggestedUsername] =
    useState<ISuggestedUsername>()
  const { createProfile, loading } = useCreateProfile()
  const {
    mainProfile,
    refetch: refetchCurrentUser,
    logout,
  } = useCurrentWallet()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: mainProfile?.username ?? '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createProfile({
        username: values.username,
        ownerWalletAddress: walletAddress,
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
          className={cn({
            'grid grid-cols-5 gap-8': !!suggestedUsernames?.length,
            'flex justify-center': !suggestedUsernames?.length,
          })}
        >
          <div
            className={cn({
              'col-span-2': !!suggestedUsernames?.length,
              'w-[350px]': !suggestedUsernames?.length,
            })}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <Label>Username</Label>
                  <FormControl>
                    <Input placeholder="Please add a title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Username can only contain letters, numbers, and underscores
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
        <div className="flex justify-between mt-auto">
          <Button
            className="w-[160px]"
            onClick={() => {
              logout()
              refetchCurrentUser()
              closeModal()
            }}
            variant={ButtonVariant.OUTLINE}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-[160px]" loading={loading}>
            Next
          </Button>
        </div>
      </form>
    </Form>
  )
}
