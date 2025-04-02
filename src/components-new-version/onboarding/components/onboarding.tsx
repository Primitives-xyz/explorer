'use client'

import { useEffect, useState } from 'react'
import { PoweredbyTapestry } from '../../common/powered-by-tapestry'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Paragraph,
  Spinner,
} from '../../ui'
import { useCurrentWallet } from '../../utils/use-current-wallet'
import { AddBioForm } from './add-bio-form'
import { AddProfileImage } from './add-profile-image'
import { CreateUsernameForm } from './create-username-form'
import { Steps } from './steps'

export function Onboarding() {
  const [open, setOpen] = useState(false)
  const { mainProfile, walletAddress, loading, isLoggedIn } = useCurrentWallet()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isLoggedIn || !!mainProfile?.hasSeenProfileSetupModal || loading) {
      return
    }

    if (!mainProfile?.username) {
      setStep(1)
    } else {
      setStep(2)
    }
  }, [mainProfile, isLoggedIn, loading])

  useEffect(() => {
    if (!!step) {
      setOpen(true)
    }
  }, [step])

  const getTitle = () => {
    if (step === 1) {
      return 'Add Username'
    } else if (step === 2) {
      return 'Add Profile Image'
    } else {
      return 'Add Bio'
    }
  }
  const getDescription = () => {
    if (step === 1) {
      return 'Type in your own username or use one from your imported identities.'
    } else if (step === 2) {
      return 'We’ve generated a profile image for you! Don’t love it? Customize your profile image from what you already own or by uploading.'
    } else {
      return 'Stand out from the crowd—describe yourself!'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        isStatic
        hideCloseButton
        className="max-w-3xl min-h-[600px] flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Create Your Profile</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-between gap-5 flex-1">
            <div className="flex flex-col gap-10 flex-1 w-full">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <Paragraph>{getTitle()}</Paragraph>
                <Steps step={step} total={3} />
                <Paragraph className="max-w-lg">{getDescription()}</Paragraph>
              </div>
              {step === 1 && (
                <CreateUsernameForm
                  walletAddress={walletAddress}
                  setStep={setStep}
                />
              )}
              {step === 2 && mainProfile && (
                <AddProfileImage
                  walletAddress={walletAddress}
                  mainProfile={mainProfile}
                  setStep={setStep}
                />
              )}
              {step === 3 && mainProfile && (
                <AddBioForm
                  walletAddress={walletAddress}
                  username={mainProfile.username}
                  setStep={setStep}
                />
              )}
            </div>
            <PoweredbyTapestry />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
