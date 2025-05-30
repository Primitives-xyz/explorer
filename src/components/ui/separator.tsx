'use client'

import { cn } from '@/utils/utils'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as React from 'react'

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    fadedEdges?: boolean
    label?: string
  }
>(
  (
    {
      className,
      orientation = 'horizontal',
      decorative = true,
      fadedEdges = false,
      label,
      ...props
    },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 relative my-6',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        {
          'bg-border': !fadedEdges,
          'bg-linear-to-r from-transparent via-border to-transparent':
            fadedEdges,
        },
        className
      )}
      {...props}
    >
      {label && (
        <div className="absolute-centered p-2 bg-background text-sm">
          {label}
        </div>
      )}
    </SeparatorPrimitive.Root>
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
