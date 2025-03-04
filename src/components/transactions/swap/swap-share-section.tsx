import { useToast } from '@/hooks/use-toast'
import { Copy, RotateCcw, Twitter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface SwapShareSectionProps {
  txSignature: string
  onReset?: () => void
}

export function SwapShareSection({
  txSignature,
  onReset,
}: SwapShareSectionProps) {
  const { toast } = useToast()
  const t = useTranslations()
  const [copied, setCopied] = useState(false)

  const tradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/trade/${txSignature}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tradeUrl)
    setCopied(true)
    toast({
      title: t('success.link_copied'),
      description: t('success.trade_link_copied_to_clipboard'),
      variant: 'success',
      duration: 2000,
    })

    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-green-900/20 p-5 rounded-xl">
      {/* Success Header */}
      <div className="flex items-center mb-8">
        <div className="bg-green-900/30 rounded-full p-3 mr-4">
          <svg
            className="w-7 h-7 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">
            {t('trade.swap_successful')}
          </h3>
          <p className="text-green-300/80">
            {t('trade.your_transaction_is_confirmed')}
          </p>
        </div>
      </div>

      {/* URL Display - Simple and clean */}
      <div className="bg-green-900/30 rounded-lg p-4 mb-6">
        <a
          href={tradeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-base font-mono text-white break-all hover:text-green-300 transition-colors"
        >
          {tradeUrl}
        </a>
      </div>

      {/* Action Buttons - Matching the screenshot */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleCopyLink}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Copy className="w-5 h-5" />
          <span>{t('trade.copy_link')}</span>
        </button>

        <button
          onClick={() => {
            window.open(
              `https://twitter.com/intent/tweet?text=Check out my latest trade on Explorer!&url=${encodeURIComponent(
                tradeUrl
              )}`,
              '_blank'
            )
          }}
          className="bg-[#1DA1F2] hover:bg-[#1a94df] text-white p-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Twitter className="w-5 h-5" />
          <span>{t('trade.share_on_twitter')}</span>
        </button>
      </div>

      {/* Swap Again Button */}
      <button
        onClick={onReset}
        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl text-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        <span>{t('trade.swap_again')}</span>
      </button>
    </div>
  )
}
