'use client'

import { IProfile } from '@/components-new-version/models/profiles.models'
import {
  Button,
  ButtonVariant,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Label,
  Textarea,
} from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useUpdateProfile } from '../../tapestry/hooks/use-update-profile'
import { EOnboardingSteps } from '../onboarding.models'
import { SuggestedBios } from './suggested-bios'

const formSchema = z.object({
  bio: z.string().max(300, { message: 'Bio must not exceed 300 characters' }),
})

interface Props {
  walletAddress: string
  mainProfile: IProfile
  setStep: (step: EOnboardingSteps) => void
}

export function AddBioForm({ walletAddress, mainProfile, setStep }: Props) {
  const { refetch: refetchCurrentUser } = useCurrentWallet()
  const { updateProfile, loading } = useUpdateProfile({
    username: mainProfile.username,
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: mainProfile.bio ?? '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateProfile({
        bio: values.bio,
      })

      refetchCurrentUser()
      setStep(EOnboardingSteps.FOLLOW)

      // form.reset()
    } catch (error: any) {
      // console.error('Error', error)
      form.setError('bio', {
        type: 'manual',
        message: error.message ?? 'Error updating bio. Please try again.',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 flex flex-col"
      >
        <div className="grid grid-cols-2 gap-8">
          <div>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <Label>Bio (optional)</Label>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <SuggestedBios walletAddress={walletAddress} />
          </div>
        </div>
        <div className="flex justify-between mt-auto">
          <Button
            onClick={() => setStep(EOnboardingSteps.IMAGE)}
            className="w-[160px]"
            disabled={loading}
            variant={ButtonVariant.OUTLINE}
          >
            Back
          </Button>
          <Button type="submit" className="w-[160px]" loading={loading}>
            Next
          </Button>
        </div>
      </form>
    </Form>
  )
}
