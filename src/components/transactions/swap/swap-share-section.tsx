import { useToast } from '@/hooks/use-toast'

interface SwapShareSectionProps {
  txSignature: string
  onReset?: () => void
}

export function SwapShareSection({
  txSignature,
  onReset,
}: SwapShareSectionProps) {
  const { toast } = useToast()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_APP_URL}/trade/${txSignature}`
    )
    toast({
      title: 'Link Copied',
      description: 'Trade link copied to clipboard',
      variant: 'success',
      duration: 2000,
    })
  }

  return (
    <div className="bg-green-900/20 p-6 rounded-lg space-y-6">
      {/* Success Header */}
      <div className="flex items-center justify-center space-x-3 pb-4">
        <div className="bg-green-500/20 rounded-full p-2">
          <svg
            className="w-8 h-8 "
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
          <h3 className="text-xl font-bold ">Swap Successful!</h3>
          <p className="/80 text-sm">Your transaction is confirmed</p>
        </div>
      </div>

      {/* Share Link Section */}
      <div className="space-y-2">
        <div className="text-sm font-medium  mb-2">Share your trade</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={`${process.env.NEXT_PUBLIC_APP_URL}/trade/${txSignature}`}
            className="flex-1 bg-green-900/20  p-3 rounded-lg text-sm font-mono"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy Link
          </button>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div className="pt-2 border-t border-green-800/30">
        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={() => {
              const url = `${process.env.NEXT_PUBLIC_APP_URL}/trade/${txSignature}`
              window.open(
                `https://twitter.com/intent/tweet?text=Check out my latest trade on Explorer!&url=${encodeURIComponent(
                  url
                )}`,
                '_blank'
              )
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg transition-colors text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            Share on Twitter
          </button>
          <button
            onClick={() => {
              const url = `${process.env.NEXT_PUBLIC_APP_URL}/trade/${txSignature}`
              window.open(
                `https://t.me/share/url?url=${encodeURIComponent(
                  url
                )}&text=Check out my latest trade on Explorer!`,
                '_blank'
              )
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] rounded-lg transition-colors text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.198-.054-.308-.346-.11l-6.4 4.02-2.766-.913c-.6-.187-.612-.6.125-.89l10.792-4.18c.504-.196.94.12.775.414z" />
            </svg>
            Share on Telegram
          </button>
        </div>
      </div>

      {/* Swap Again Button */}
      <div className="pt-4">
        <button
          onClick={onReset}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Swap Again
        </button>
      </div>
    </div>
  )
}
