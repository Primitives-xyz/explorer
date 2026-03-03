import { cn } from '@/utils/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-mono transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-primary/30 text-primary bg-primary/8',
        secondary:
          'border-secondary/30 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20',
        outline: 'text-foreground/70 border-border/40',
        ghost: 'border-foreground/10 bg-transparent text-foreground/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
