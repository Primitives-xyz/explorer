import * as React from 'react'
import { cn } from '../../utils/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixElement?: React.ReactNode
  suffixElement?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      type,
      prefixElement,
      suffixElement,
      ...props
    },
    ref
  ) => {
    // const { error } = useFormField()

    return (
      <div className={cn('relative', containerClassName)}>
        {prefixElement}
        <input
          type={type}
          className={cn(
            'flex file:py-2 h-12 w-full rounded-input border border-input-border bg-input text-input-foreground px-3 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-default focus:outline-hidden focus:border-primary',
            {
              // 'border-destructive': !!error,
              // 'focus-visible:ring-destructive border-destructive': !!error,
              'pl-11': !!prefixElement,
              'pr-11': !!suffixElement,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {suffixElement}
      </div>
    )
  }
)
Input.displayName = 'Input'

const InputPrefix = React.forwardRef<
  HTMLInputElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onTheRight?: boolean
  }
>(({ className, onTheRight, children, ...props }, ref) => {
  return (
    <div
      className={cn(
        'absolute top-0 flex items-center justify-center h-full w-12',
        {
          'left-0': !onTheRight,
          'right-0': onTheRight,
        },
        className
      )}
      ref={ref}
      {...props}
    >
      <div
        className={cn('flex items-center justify-center', {
          'text-2xl': typeof children !== 'string',
          'text-base': typeof children === 'string',
        })}
      >
        {children}
      </div>
    </div>
  )
})
InputPrefix.displayName = 'InputPrefix'

export { Input, InputPrefix }
