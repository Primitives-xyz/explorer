'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import * as React from 'react'
import { cn } from '../../utils/utils'
import { Spinner } from '../spinner'

const focus =
  'ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

const buttonBase = cn(
  'inline-flex items-center justify-center whitespace-nowrap gap-1.5 transition-all duration-100 focus-visible:outline-hidden shrink-0 relative cursor-pointer',
  focus
)

const buttonVariants = cva(cn(buttonBase, 'rounded-button font-medium'), {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/80',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline:
        'border border-primary text-primary bg-transparent hover:bg-accent',
      'outline-white':
        'border border-foreground text-foreground bg-transparent hover:bg-accent',
      secondary:
        'bg-secondary/10 text-secondary-foreground border border-secondary hover:bg-secondary/20',
      ghost: 'hover:bg-accent text-foreground',
      link: 'underline-offset-4 hover:opacity-80 underline h-auto! p-0! rounded-sm',
    },
    size: {
      default: 'h-9 px-4 py-2',
      sm: 'h-7 px-3.5 text-xs',
      lg: 'h-16 px-12 text-xl uppercase',
      icon: 'h-10 w-10',
      icon_sm: 'h-6 w-6',
      icon_lg: 'h-11 w-11',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  expand?: boolean
  loading?: boolean
  isInvisible?: boolean
  disableHoverFeedback?: boolean
  disableActiveFeedback?: boolean
  newTab?: boolean
  href?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      expand = false,
      loading = false,
      isInvisible = false,
      disableHoverFeedback = false,
      disableActiveFeedback = false,
      newTab = false,
      href,
      ...props
    },
    ref
  ) => {
    const Comp = asChild || !!href ? Slot : 'button'
    const content = (
      <>
        {loading && <Spinner className="icon-text-size" />}
        {(!loading || !size?.includes('icon')) && props.children}
      </>
    )
    const disabled = props.disabled || loading
    const children = href ? (
      <Link href={href} target={newTab ? '_blank' : undefined}>
        {content}
      </Link>
    ) : (
      content
    )

    return (
      <Comp
        className={cn(
          isInvisible
            ? cn(
                buttonBase,
                {
                  'hover:opacity-80': !disableHoverFeedback,
                },
                className
              )
            : buttonVariants({ variant, size, className }),
          {
            'w-full': expand,
            'active:opacity-80 active:scale-95': !disableActiveFeedback,
            'pointer-events-none opacity-50':
              !disableActiveFeedback && disabled,
          }
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export type { ButtonProps }
