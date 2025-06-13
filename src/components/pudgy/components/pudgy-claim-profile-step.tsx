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
} from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Send,
  Wallet,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
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
    transactionStatus,
    loading: pudgyPaymentLoading,
    error: pudgyPaymentError,
    pay,
    balance,
    hasInsufficientBalance,
    requiredAmount,
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
  const [pudgyTheme, setPudgyTheme] = useState(EPudgyTheme.BLUE)
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

  // Handle successful transaction confirmation
  useEffect(() => {
    if (transactionStatus?.status === 'confirmed') {
      // Show success toast
      toast.success('Transaction confirmed! Setting up your Pudgy profile...')
      console.log('Transaction confirmed on blockchain:', transactionStatus)
    }
  }, [transactionStatus])

  // Handle backend confirmation and navigation
  useEffect(() => {
    console.log('Backend transaction status:', transactionStatusData)

    const updatePudgyProfile = async () => {
      console.log('Updating Pudgy profile with:', {
        username: form.getValues('username'),
        pudgyTheme,
        pudgyFrame,
      })

      try {
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

        console.log('Profile updated successfully')
        await refetchCurrentUser()
        console.log('User data refetched')

        // Show success message
        toast.success('Pudgy profile activated successfully!')

        // Navigate to profile
        console.log('Navigating to profile:', mainProfile.id)
        push(
          route('entity', {
            id: mainProfile.id,
          })
        )
      } catch (error) {
        console.error('Error updating Pudgy profile:', error)
        toast.error('Failed to update profile. Please try again.')
      }
    }

    if (transactionStatusData?.status === ECryptoTransactionStatus.COMPLETED) {
      console.log('Transaction completed on backend, updating profile...')
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
      toast.error(typeof error === 'string' ? error : error.message)
    }
  }, [error])

  // Get button content based on transaction status
  const getButtonContent = () => {
    if (!transactionStatus) {
      return <>Burn {paymentDetailsData?.tokenSymbol || 'PENGU'}</>
    }

    switch (transactionStatus.status) {
      case 'sending':
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Building Transaction...
          </>
        )
      case 'sent':
        return (
          <>
            <Send className="w-5 h-5 mr-2" />
            Sending Transaction...
          </>
        )
      case 'confirming':
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Confirming Transaction...
          </>
        )
      case 'confirmed':
        return (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Transaction Confirmed!
          </>
        )
      case 'failed':
      case 'timeout':
        return (
          <>
            <AlertTriangle className="w-5 h-5 mr-2" />
            Transaction Failed - Retry
          </>
        )
      default:
        return <>Burn {paymentDetailsData?.tokenSymbol || 'PENGU'}</>
    }
  }

  // Check if we should disable the button
  const isButtonDisabled = () => {
    if (hasInsufficientBalance) return true
    if (loading) return true
    if (transactionStatus?.status === 'confirmed') return true
    if (
      transactionStatus?.status === 'sending' ||
      transactionStatus?.status === 'sent' ||
      transactionStatus?.status === 'confirming'
    )
      return true
    return false
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 flex flex-col justify-center"
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-background/50 rounded-lg p-6 space-y-6">
            {/* Compact Header with Back Button */}
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant={ButtonVariant.GHOST}
                onClick={() => setStep(EPudgyOnboardingStep.INTRO)}
                type="button"
                className="p-0 h-auto hover:bg-transparent"
              >
                ← Back
              </Button>
              {hasInsufficientBalance && (
                <div className="flex items-center gap-2 text-amber-500 text-sm">
                  <AlertTriangle size={14} />
                  <span className="font-medium">Insufficient Balance</span>
                </div>
              )}
            </div>

            {/* Main Layout - Always the same structure */}
            <div className="space-y-6">
              {/* Top Section - Avatar and Form side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-[240px]">
                    <PudgyAvatarFrameSelection
                      displayPudgyFrame={pudgyFrame}
                      setDisplayPudgyFrame={setPudgyFrame}
                      pudgyTheme={pudgyTheme}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <Label className="text-sm">
                          {t('onboarding.form.username.label')}
                        </Label>
                        <FormControl>
                          <Input
                            placeholder={t(
                              'onboarding.form.username.placeholder'
                            )}
                            autoFocus
                            className="h-9"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
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

              {/* Large Action Area - Changes based on balance */}
              <div className="space-y-2">
                {hasInsufficientBalance ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 space-y-4">
                    {/* Balance Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Required:</span>
                        <span className="font-medium">
                          {Math.ceil(parseFloat(String(requiredAmount || '0')))}{' '}
                          PENGU
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">
                          Your balance:
                        </span>
                        <span className="font-medium text-amber-500">
                          {Math.floor(parseFloat(String(balance || '0')))} PENGU
                        </span>
                      </div>
                      <div className="h-px bg-amber-500/20" />
                      <div className="flex justify-between text-lg">
                        <span className="text-muted-foreground font-medium">
                          Need:
                        </span>
                        <span className="font-bold text-red-400">
                          {Math.ceil(
                            parseFloat(String(requiredAmount || '0')) -
                              parseFloat(String(balance || '0'))
                          )}{' '}
                          PENGU
                        </span>
                      </div>
                    </div>

                    {/* Buy Button */}
                    <Link
                      href="https://www.sse.gg/trade?inputMint=So11111111111111111111111111111111111111112&outputMint=2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200"
                        type="button"
                      >
                        <Wallet size={20} className="mr-2" />
                        Buy PENGU
                        <ExternalLink size={18} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Button
                      className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isButtonDisabled()}
                      type="submit"
                    >
                      {getButtonContent()}
                    </Button>
                    {!!paymentDetailsData && !transactionStatus && (
                      <p className="text-sm text-muted-foreground text-center">
                        Cost: {paymentDetailsData.amount}{' '}
                        {paymentDetailsData.tokenSymbol}
                      </p>
                    )}
                    {transactionStatus?.signature && (
                      <p className="text-xs text-muted-foreground text-center">
                        <a
                          href={`https://solscan.io/tx/${transactionStatus.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          View on Solscan →
                        </a>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
