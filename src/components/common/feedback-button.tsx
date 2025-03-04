'use client'

import { MessageCircle } from 'lucide-react'

export function FeedbackButton() {
  const handleClick = () => {
    const text = encodeURIComponent('@usetapestry @nemoblackburn @apollotoday hi $SSE devs, please fix/improve:')
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 bg-[#292C31] hover:bg-black/90 border border-green-800/50 hover:border-green-500/50 text-green-500 px-3 py-1.5 rounded transition-all z-[9999] shadow-md flex items-center gap-2 font-mono text-xs"
      title="Send Feedback"
    >
      <MessageCircle className="w-4 h-4" />
      <span>GIVE FEEDBACK</span>
    </button>
  )
} 