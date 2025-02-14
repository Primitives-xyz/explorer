'use client'

import { Copy, Link2, MessageCircle, Share2, Twitter } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  children?: ReactNode
  className?: string
}

export default function ShareButton({
  title,
  text,
  url,
  children,
  className = '',
}: ShareButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [hasShareApi, setHasShareApi] = useState(false)
  const shareUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '')

  useEffect(() => {
    setHasShareApi(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
      setShowDropdown(false)
    } catch (error) {
      toast.error('Failed to copy link')
      console.error('Error copying:', error)
    }
  }

  const handleShare = async () => {
    try {
      if (hasShareApi) {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        })
        setShowDropdown(false)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Failed to share')
        console.error('Error sharing:', error)
      }
    }
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank')
    setShowDropdown(false)
  }

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(text)}`
    window.open(telegramUrl, '_blank')
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={className}
        type="button"
      >
        {children}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg bg-black/90 border border-green-800/40 shadow-lg z-50">
          {/* Quick Copy Button */}
          <div className="p-3 flex items-center justify-between border-b border-green-800/40">
            <div className="flex-1">
              <div className="text-xs  mb-1">Quick Copy</div>
              <div className="text-sm ">Copy link to clipboard</div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 hover:bg-green-900/30 rounded-md transition-colors "
            >
              <Copy size={14} />
              <span className="text-sm">Copy</span>
            </button>
          </div>

          {/* URL Preview */}
          <div className="p-3 border-b border-green-800/40">
            <div className="text-xs  mb-1">Share URL</div>
            <div className="flex items-center gap-2 bg-black/50 p-2 rounded-md">
              <Link2 size={14} className=" flex-shrink-0" />
              <div className="flex-1 truncate text-sm ">{shareUrl}</div>
            </div>
          </div>

          {/* Share Options */}
          <div className="p-1">
            {hasShareApi && (
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-3 py-2  hover:bg-green-900/30 rounded-md transition-colors"
              >
                <Share2 size={16} className="" />
                <span>Share...</span>
              </button>
            )}
            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center gap-3 px-3 py-2  hover:bg-green-900/30 rounded-md transition-colors"
            >
              <Twitter size={16} className="" />
              <span>Share on Twitter</span>
            </button>
            <button
              onClick={handleTelegramShare}
              className="w-full flex items-center gap-3 px-3 py-2  hover:bg-green-900/30 rounded-md transition-colors"
            >
              <MessageCircle size={16} className="" />
              <span>Share on Telegram</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
