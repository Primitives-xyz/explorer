'use client'

import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { EPudgyTheme } from '../pudgy.models'

export function TestThemeButton() {
  const { mainProfile, refetch } = useCurrentWallet()
  const { updateProfile } = useUpdateProfile({
    profileId: mainProfile?.username ?? '',
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Theme</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Custom theme</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={async () => {
                  await updateProfile({
                    properties: [
                      {
                        key: 'pudgyTheme',
                        value: EPudgyTheme.DEFAULT,
                      },
                    ],
                  })
                  refetch()
                }}
              >
                Default
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await updateProfile({
                    properties: [
                      {
                        key: 'pudgyTheme',
                        value: EPudgyTheme.BLUE,
                      },
                    ],
                  })
                  refetch()
                }}
              >
                Green
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await updateProfile({
                    properties: [
                      {
                        key: 'pudgyTheme',
                        value: EPudgyTheme.PINK,
                      },
                    ],
                  })
                  refetch()
                }}
              >
                Pink
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await updateProfile({
                    properties: [
                      {
                        key: 'pudgyTheme',
                        value: EPudgyTheme.BLUE,
                      },
                    ],
                  })
                  refetch()
                }}
              >
                Blue
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
