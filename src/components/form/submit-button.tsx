'use client'

import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  disabled?: boolean
}

export function SubmitButton({ children, disabled, ...props }: Props) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full px-4 py-1.5 border border-green-500/50  hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      {children}
    </button>
  )
}
