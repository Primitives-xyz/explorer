'use client'

import { Button, ButtonVariant } from '@/components/ui'
import Image from 'next/image'
import { EPudgyOnboardingStep } from '../pudgy.models'

interface Props {
  onClose: () => void
  setStep: (step: EPudgyOnboardingStep) => void
}

export function PudgyUpgradeBenefits({ onClose, setStep }: Props) {
  const benefits = [
    {
      title: 'Premium Pudgy Profile UI',
      description:
        'Level up your SSE profile with a beautiful, branded Pudgy design.',
    },
    {
      title: 'Animated Pudgy Profile Frame',
      description:
        'A dynamic profile frame that follows you across the site—show off in style.',
    },
    {
      title: 'Early Access to Pudgy x SSE Drops',
      description:
        'Be the first in line for limited-edition merch and collabs.',
    },
  ]

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="shrink-0 mt-6 desktop">
          <Image
            src="/images/pudgy/pudgy-onboarding.webp"
            alt="Pudgy Penguin"
            width={128}
            height={158}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-bold">What You'll Get</h2>

          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-lg mt-0.5">✅</span>
                <div className="">
                  <h3 className="font-bold">{benefit.title}</h3>
                  <p className="text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center flex flex-col items-center text-sm text-muted-foreground mt-5">
        <p className="flex items-center gap-2">
          <span>🔥</span>
          This is a one-time burn. No refunds. Maximum drip.
          <span>🔥</span>
        </p>
        <p className="flex items-center gap-2">
          <span>👉</span>
          When you're ready, sign the transaction in Phantom to complete the
          upgrade.
          <span>👈</span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-3 justify-between mt-6 md:mt-auto w-full">
        <Button
          onClick={onClose}
          className="w-full md:w-[160px] order-1 md:order-0"
          variant={ButtonVariant.OUTLINE}
        >
          Cancel
        </Button>
        <Button
          onClick={() => setStep(EPudgyOnboardingStep.CLAIM)}
          className="w-full md:w-[160px]"
        >
          Claim Profile
        </Button>
      </div>
    </div>
  )
}
