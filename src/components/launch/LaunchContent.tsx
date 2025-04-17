'use client'

import { LaunchData } from '@/components/launch/launch-data/LaunchData'
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
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span className="text-amber-400 font-medium">Wallet not connected</span>
              </div>
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