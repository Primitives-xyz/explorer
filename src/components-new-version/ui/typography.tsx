import { cn } from '@/utils'

export function Heading1({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h1 className={cn('scroll-m-20 text-3xl font-bold', className)}>
      {children}
    </h1>
  )
}

export function Heading2({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h2 className={cn('scroll-m-20 text-2xl font-bold uppercase', className)}>
      {children}
    </h2>
  )
}

export function Heading3({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h2 className={cn('scroll-m-20 text-3xl font-bold', className)}>
      {children}
    </h2>
  )
}

export function Subtitle({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h2
      className={cn('scroll-m-20 text-lg uppercase leading-tight', className)}
    >
      {children}
    </h2>
  )
}
