import { ArrowRight } from 'lucide-react'

interface TapestryPromoSectionProps {
  hideTitle?: boolean
}

export const TapestryPromoSection = ({
  hideTitle = false,
}: TapestryPromoSectionProps) => {
  return (
    <div className="border border-green-800 bg-black/50 w-full h-full overflow-hidden flex flex-col relative group">
      {/* Header */}
      {!hideTitle && (
        <div className="border-b border-green-800 p-2 flex-shrink-0 bg-black/30">
          <div className="text-green-500 text-sm font-mono whitespace-nowrap">
            {'>'} tapestry_social
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-2 font-mono scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50">
        <div className="space-y-3">
          <div className="text-lg text-green-400 font-bold">
            Are you a Solana builder?
          </div>
          <p className="text-green-600 text-sm leading-relaxed">
            Solana needs YOU to add social features to your app! Get started
            with Tapestry&apos;s powerful social toolkit.
          </p>
        </div>

        <a
          href="https://www.usetapestry.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all border border-green-500/20 hover:border-green-500/40"
        >
          <span className="text-sm font-semibold">Start Building</span>
          <ArrowRight
            size={14}
            className="transform group-hover:translate-x-1 transition-transform"
          />
        </a>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
    </div>
  )
}
