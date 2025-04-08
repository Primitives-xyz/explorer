'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../../utils/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-11 items-center justify-center p-1 mb-3',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const tabsVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap border-b border-b-muted-foreground/30 text-muted-foreground hover:bg-accent px-3 h-full ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-medium cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'data-[state=active]:border-b-primary data-[state=active]:text-primary',
        social:
          'data-[state=active]:border-b-secondary data-[state=active]:text-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    // className={cn(
    //   'inline-flex items-center justify-center whitespace-nowrap rounded-t-button border border-b-0 border-primary text-primary hover:bg-primary/10 px-3 h-full font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-background data-[state=active]:shadow-sm cursor-pointer',
    //   className
    // )}
    className={cn(tabsVariants({ variant, className }))}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsContent, TabsList, TabsTrigger }
