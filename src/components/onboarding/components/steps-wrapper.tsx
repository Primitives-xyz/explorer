import { Paragraph } from '@/components/ui'
import { useTranslations } from 'next-intl'
import { EOnboardingSteps } from '../onboarding.models'
import { Steps } from './steps'

export function StepsWrapper({ step }: { step: EOnboardingSteps }) {
  const t = useTranslations()

  const getTitle = () => {
    if (step === EOnboardingSteps.USERNAME) {
      return t('onboarding.steps.titles.add_username')
    } else if (step === EOnboardingSteps.IMAGE) {
      return t('onboarding.steps.titles.add_profile_image')
    } else {
      return t('onboarding.steps.titles.add_bio')
    }
  }

  const getDescription = () => {
    if (step === EOnboardingSteps.USERNAME) {
      return t('onboarding.steps.descriptions.username')
    } else if (step === EOnboardingSteps.IMAGE) {
      return t('onboarding.steps.descriptions.profile_image')
    } else {
      return t('onboarding.steps.descriptions.bio')
    }
  }

  const getStepIndex = () => {
    if (step === EOnboardingSteps.USERNAME) {
      return 1
    } else if (step === EOnboardingSteps.IMAGE) {
      return 2
    } else if (step === EOnboardingSteps.BIO) {
      return 3
    } else {
      return 4
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <Paragraph>{getTitle()}</Paragraph>
      <Steps step={getStepIndex()} total={3} />
      <Paragraph className="max-w-lg">{getDescription()}</Paragraph>
    </div>
  )
}
