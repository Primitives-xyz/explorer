'use client'

import { cn } from '@/utils/utils'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    displayArrow?: boolean
  }
>(({ className, sideOffset = 4, displayArrow, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded border border-foreground/20 bg-popover backdrop-blur-xl px-3 py-1.5 text-popover-foreground shadow-toolkit animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 text-sm',
        className
      )}
      {...props}
    >
      {props.children}
      {displayArrow && (
        <TooltipPrimitive.Arrow
          className={cn('fill-popover w-4 h-2 relative', {
            '-top-px': props.side === 'bottom',
            '-left-px': props.side === 'right',
            '-right-px': props.side === 'left',
            '-bottom-px': props.side === 'top',
          })}
        />
      )}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
