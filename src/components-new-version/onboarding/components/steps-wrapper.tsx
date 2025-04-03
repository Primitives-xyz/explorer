import { Paragraph } from '@/components-new-version/ui'
import { EOnboardingSteps } from '../onboarding.models'
import { Steps } from './steps'

export function StepsWrapper({ step }: { step: EOnboardingSteps }) {
  const getTitle = () => {
    if (step === EOnboardingSteps.USERNAME) {
      return 'Add Username'
    } else if (step === EOnboardingSteps.IMAGE) {
      return 'Add Profile Image'
    } else {
      return 'Add Bio'
    }
  }

  const getDescription = () => {
    if (step === EOnboardingSteps.USERNAME) {
      return 'Type in your own username or use one from your imported identities.'
    } else if (step === EOnboardingSteps.IMAGE) {
      return 'We’ve generated a profile image for you! Don’t love it? Customize your profile image from what you already own or by uploading.'
    } else {
      return 'Stand out from the crowd—describe yourself!'
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
