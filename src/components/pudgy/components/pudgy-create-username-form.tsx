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
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export function PudgyCreateUsernameForm() {
  const t = useTranslations()

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
      username: '',
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
        <div className="flex justify-between mt-auto">
          <Button
            className="w-[48%] md:w-[160px]"
            onClick={() => {
              // logout()
              // refetchCurrentUser()
              // closeModal()
            }}
            variant={ButtonVariant.OUTLINE}
          >
            {t('onboarding.buttons.cancel')}
          </Button>
          <Button
            type="submit"
            className="w-[48%] md:w-[160px]"
            // loading={loading}
          >
            {t('onboarding.buttons.next')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
