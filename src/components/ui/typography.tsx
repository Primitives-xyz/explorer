import { cn } from '@/utils/utils'

export function Heading1({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h1 className={cn('scroll-m-20 text-3xl font-bold tracking-tight', className)}>
      {children}
    </h1>
  )
}

export function Heading2({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h2 className={cn('scroll-m-20 text-2xl font-bold tracking-tight', className)}>
      {children}
    </h2>
  )
}

export function Heading3({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h3 className={cn('scroll-m-20 text-xl font-bold tracking-tight', className)}>
      {children}
    </h3>
  )
}

export function Heading4({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <h4 className={cn('scroll-m-20 text-lg font-medium', className)}>
      {children}
    </h4>
  )
}

export function Paragraph({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={cn('text-base text-foreground/80', className)}>{children}</p>
}
