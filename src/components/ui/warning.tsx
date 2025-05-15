import { cn } from '@/utils/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const warningVariants = cva(
  'px-4 py-2 rounded text-sm border',
  {
    variants: {
      variant: {
        loud: 'bg-yellow-100 border-yellow-400 text-yellow-800',
        quiet: 'bg-muted border-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'loud',
    },
  }
)

export interface WarningProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof warningVariants> {}

export default function Warning({ className, variant, ...props }: WarningProps) {
  return (
    <div className={cn(warningVariants({ variant }), className)} {...props} />
  )
} 