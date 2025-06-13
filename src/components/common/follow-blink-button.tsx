'use client'

import { Button, ButtonProps, ButtonSize, ButtonVariant } from '@/components/ui'
import { cn } from '@/utils/utils'
import { CheckIcon, ShareIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props extends Omit<ButtonProps, 'children' | 'variant'> {
  username: string
  isPudgy?: boolean
}

export function FollowBlinkButton({ username, isPudgy, ...props }: Props) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations()

  // Get the current host for generating the blink URL
  const getBlinkUrl = () => {
    if (typeof window === 'undefined') return ''
    const { protocol, host } = window.location
    // Updated to use dynamic route structure with username as path parameter
    return `${protocol}//${host}/${encodeURIComponent(username)}`
  }

  const handleCopyBlinkUrl = async () => {
    try {
      const blinkUrl = getBlinkUrl()
      await navigator.clipboard.writeText(blinkUrl)
      setCopied(true)
      toast.success(t('common.follow.blink_copied', { username }))

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy blink URL:', error)
      toast.error(t('common.follow.blink_copy_failed'))
    }
  }

  // const getButtonContent = () => {
  //   const iconSize = displayVariant === 'icon' ? 16 : 14
  //   const Icon = copied ? Check : Share

  //   if (displayVariant === 'icon') {
  //     return <Icon size={iconSize} />
  //   }

  //   if (displayVariant === 'minimal') {
  //     return <Icon size={iconSize} />
  //   }

  //   return (
  //     <>
  //       <Icon size={iconSize} />
  //       {showLabel &&
  //         (copied ? t('common.copied') : t('common.follow.share_blink'))}
  //     </>
  //   )
  // }

  const isIcon = props.size === ButtonSize.ICON

  return (
    <Button
      {...props}
      onClick={handleCopyBlinkUrl}
      variant={
        isPudgy ? ButtonVariant.PUDGY_SECONDARY : ButtonVariant.SECONDARY_SOCIAL
      }
      className={cn(
        'transition-all duration-200',
        {
          // 'text-primary': copied,
        },
        props.className
      )}
      title={t('common.follow.blink_tooltip', { username })}
    >
      {copied ? (
        <>
          <CheckIcon size={18} />
          {!isIcon && t('common.copied')}
        </>
      ) : (
        <>
          {(!isPudgy || isIcon) && <ShareIcon size={16} />}
          {!isIcon && t('common.follow.share_blink')}
        </>
      )}
    </Button>
  )
}
