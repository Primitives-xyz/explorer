'use client'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Label,
} from '@/components/ui'
import { CheckCircleIcon, CopyIcon } from 'lucide-react'
import { LaunchData } from '@/components/launch/hooks/use-launch'

interface Props {
  launchData: LaunchData
  copyToClipboard: (text: string) => void
  onLaunchAnother: () => void
}

export function LaunchSuccess({ launchData, copyToClipboard, onLaunchAnother }: Props) {
  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Success!</CardTitle>
          </div>
          <CardDescription className="text-green-700">
            Your token has been launched successfully. Below are the details of your token.
          </CardDescription>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div>
          <Label className="block mb-2 font-semibold">Token Mint Address</Label>
          <div className="flex items-center space-x-2">
            <code className="bg-muted p-2 rounded text-sm flex-1 overflow-x-auto">
              {launchData.mintB}
            </code>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(launchData.mintB || '')}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label className="block mb-2 font-semibold">Pool Address</Label>
          <div className="flex items-center space-x-2">
            <code className="bg-muted p-2 rounded text-sm flex-1 overflow-x-auto">
              {launchData.poolAddress}
            </code>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(launchData.poolAddress || '')}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label className="block mb-2 font-semibold">Transaction Signature</Label>
          <div className="flex items-center space-x-2">
            <code className="bg-muted p-2 rounded text-sm flex-1 overflow-x-auto">
              {launchData.transaction}
            </code>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(launchData.transaction || '')}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button onClick={onLaunchAnother}>
            Launch Another Token
          </Button>
        </div>
      </div>
    </div>
  )
} 