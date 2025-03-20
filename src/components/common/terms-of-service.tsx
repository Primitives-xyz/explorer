'use client'

import Link from 'next/link'

export function TermsOfService() {
  return (
    <div className="w-full border-t border-white/20 py-4 mt-auto">
      <div className="container mx-auto flex justify-center items-center text-[16px] text-gray-400">
        <Link 
          href="https://cdn.sse.gg/legal" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-green-500 transition-colors"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  )
} 