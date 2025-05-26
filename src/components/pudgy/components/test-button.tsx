'use client'

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
import { EPudgyTheme } from '../pudgy.models'
import { usePudgyStore } from '../stores/use-pudgy-store'

export function TestButton() {
  const { setTheme } = usePudgyStore()

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
              <DropdownMenuItem onClick={() => setTheme(EPudgyTheme.DEFAULT)}>
                Default
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(EPudgyTheme.BLUE)}>
                Blue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(EPudgyTheme.GREEN)}>
                Green
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(EPudgyTheme.PINK)}>
                Pink
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
