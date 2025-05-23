'use client'

import { cn } from '@/utils/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import * as React from 'react'
import { UrlObject } from 'url'
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
      secondary:
        'bg-primary/10 text-foreground/90 border border-primary hover:bg-primary/20',
      outline:
        'border border-primary text-primary bg-transparent hover:bg-accent',
      badge:
        'bg-primary/10 text-primary/80 border border-primary/20 hover:bg-primary/20',

      'default-social':
        'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      'secondary-social':
        'bg-secondary/10 text-foreground/90 border border-secondary hover:bg-secondary/20',
      'outline-social':
        'border border-secondary text-secondary bg-transparent hover:bg-accent',
      'badge-social':
        'bg-secondary/10 text-secondary/80 border border-secondary/20 hover:bg-secondary/20',

      'badge-white':
        'bg-foreground/10 text-foreground/80 border border-foreground/20 hover:bg-foreground/20',
      'outline-white':
        'border border-foreground text-foreground bg-transparent hover:bg-accent',
      ghost: 'hover:bg-accent text-foreground',
      selectable:
        'bg-primary/10 text-foreground border border-primary/20 rounded-full',
      'selectable-active':
        'bg-primary text-primary-foreground border border-primary rounded-full',
      link: 'underline-offset-4 hover:opacity-80 h-auto! p-0! rounded-sm',
    },
    size: {
      default: 'h-9 px-4 py-2 text-sm',
      sm: 'h-6 px-2 text-xs',
      lg: 'h-11.5 px-12 text-sm font-semibold uppercase',
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
  loading?: boolean
  isInvisible?: boolean
  disableHoverFeedback?: boolean
  disableActiveFeedback?: boolean
  newTab?: boolean
  href?: string | UrlObject
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className: _className,
      variant,
      size,
      asChild = false,
      loading = false,
      isInvisible = false,
      disableHoverFeedback = false,
      disableActiveFeedback = false,
      newTab = false,
      href,
      type = 'button',
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

    const className = cn(
      {
        'active:opacity-80 active:scale-95': !disableActiveFeedback,
        'pointer-events-none opacity-50': !disableActiveFeedback && disabled,
      },
      _className
    )

    // const hoverEffect = disableHoverFeedback ? '' : 'hover:scale-105'

    return (
      <Comp
        className={cn(
          isInvisible
            ? cn(
                buttonBase,
                {
                  'hover:opacity-80 hover:scale': !disableHoverFeedback,
                },
                className
              )
            : buttonVariants({
                variant,
                size,
                // className: cn(hoverEffect, className),
                className,
              })
        )}
        ref={ref}
        disabled={disabled}
        type={type}
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
