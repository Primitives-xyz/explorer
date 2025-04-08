'use client'

import { SwapForm } from '@/components/transactions/swap/swap-form'
import { Button } from '@/components/ui/button'
import { DataCard } from '@/components/ui/data-card'
import { route } from '@/utils/routes'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FollowSuggestedUsers } from './follow-suggested-users'

// SSE token address
const SSE_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'

interface OnboardingStepsProps {
  walletAddress?: string
  username?: string
}

export function OnboardingSteps({
  walletAddress,
  username,
}: OnboardingStepsProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [swapCompleted, setSwapCompleted] = useState(false)

  const steps = [
    {
      title: 'Follow other users',
      description:
        'Follow some top traders and popular profiles to start building your feed',
      component: <FollowSuggestedUsers />,
    },
    {
      title: 'Swap your first tokens',
      description: 'Get some SSE tokens to unlock additional features',
      component: (
        <div className="max-w-md mx-auto">
          <DataCard
            title="Token Swap"
            borderColor="violet"
            className="overflow-hidden"
          >
            <div className="p-4">
              <SwapForm
                initialInputMint="So11111111111111111111111111111111111111112"
                initialOutputMint={SSE_MINT}
                initialAmount="0.05"
                inputTokenName="SOL"
                outputTokenName="SSE"
                inputDecimals={9}
              />
            </div>
          </DataCard>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => {
                setSwapCompleted(true)
                setCurrentStep(currentStep + 1)
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {swapCompleted ? "I've completed my swap" : 'Skip for now'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Make your first comment',
      description: 'Visit your profile page and make your first comment',
      component: (
        <div className="mt-6">
          <DataCard
            title="Ready to Explore"
            borderColor="violet"
            className="overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="mb-6 text-violet-300/80">
                Head to your profile page to see your activity feed and share
                your first comment!
              </div>
              <Button
                onClick={() =>
                  router.push(route('address', { id: username ?? '' }))
                }
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Go to my profile
              </Button>
            </div>
          </DataCard>
        </div>
      ),
    },
  ]

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Handle completion
      router.push(route('address', { id: username ?? '' }))
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="border border-violet-500/30 rounded-lg backdrop-blur-xs bg-black/30 overflow-hidden">
      {/* Progress indicators */}
      <div className="bg-violet-950/30 border-b border-violet-500/30 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center w-full">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 flex items-center">
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`rounded-lg h-8 w-8 flex items-center justify-center ${
                      index < currentStep
                        ? 'bg-violet-600 text-white'
                        : index === currentStep
                        ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50'
                        : 'bg-violet-900/20 text-violet-400/50 ring-1 ring-violet-600/20'
                    }`}
                  >
                    {index < currentStep ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div
                    className={`text-xs font-medium mt-2 text-center w-full px-2 ${
                      index === currentStep
                        ? 'text-violet-300'
                        : 'text-violet-300/50'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 mt-[-20px] ${
                      index < currentStep ? 'bg-violet-500' : 'bg-violet-900/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current step content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2 text-violet-200">
          {steps[currentStep].title}
        </h2>
        <p className="text-violet-300/70 mb-6">
          {steps[currentStep].description}
        </p>
        <div>{steps[currentStep].component}</div>
      </div>

      {/* Navigation buttons */}
      <div className="border-t border-violet-500/30 p-4 bg-violet-950/20 flex justify-between">
        <Button
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className="bg-violet-900/50 hover:bg-violet-900/80 text-violet-300 disabled:opacity-50 disabled:pointer-events-none border border-violet-700/30"
        >
          Previous
        </Button>
        <Button
          onClick={handleNextStep}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
