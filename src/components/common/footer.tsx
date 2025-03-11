'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full border-t border-green-800/50 py-4 mt-auto">
      <div className="container mx-auto flex justify-center items-center text-xs text-gray-400">
        <Link 
          href="https://legal.sse.gg" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-green-500 transition-colors"
        >
          Terms of Service
        </Link>
      </div>
    </footer>
  )
} 