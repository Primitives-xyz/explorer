'use client'

import { LaunchData } from '@/components/launch/launch-data/launch-data'
import { Card, CardContent, Heading2, Paragraph } from '@/components/ui'
import { useLaunch } from '@/components/launch/hooks/use-launch'

export function LaunchContent() {
  const { isLoggedIn, setShowAuthFlow } = useLaunch()

  return (
    <div className="space-y-8">
      <div>
        <Heading2 className="mb-4">SSE Token Launcher</Heading2>
        <Paragraph className="mb-6">
          Launch your own tokens using the SSE AMM.
        </Paragraph>
        
        {!isLoggedIn && (
          <Card className="mb-6 border-amber-400/50 bg-amber-50/10">
            <CardContent className="pt-6">
                <span className="text-amber-400 font-medium">Wallet not connected</span>
              <p className="text-sm mt-2 mb-4">You need to connect your wallet to launch tokens.</p>
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                onClick={() => setShowAuthFlow?.(true)}
              >
                Connect Wallet
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      <LaunchData />
    </div>
  )
} 