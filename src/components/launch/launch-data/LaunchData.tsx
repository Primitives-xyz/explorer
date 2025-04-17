'use client'

import { useLaunch } from '@/components/launch/hooks/use-launch'
import { LaunchForm } from '@/components/launch/launch-data/LaunchForm'
import { LaunchSuccess } from '@/components/launch/launch-data/LaunchSuccess'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export function LaunchData() {
  const { 
    launchToken, 
    isLoading, 
    findingTapAddress, 
    tapAddressAttempts, 
    launchSuccess, 
    launchData, 
    copyToClipboard, 
    resetLaunch 
  } = useLaunch()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch a Token Pool</CardTitle>
        <CardDescription>
          Create a new tradable token on the SSE AMM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {launchSuccess ? (
          <LaunchSuccess 
            launchData={launchData} 
            copyToClipboard={copyToClipboard} 
            onLaunchAnother={resetLaunch} 
          />
        ) : (
          <LaunchForm 
            onSubmit={launchToken} 
            isLoading={isLoading} 
            findingTapAddress={findingTapAddress} 
            tapAddressAttempts={tapAddressAttempts} 
          />
        )}
      </CardContent>
    </Card>
  )
} 