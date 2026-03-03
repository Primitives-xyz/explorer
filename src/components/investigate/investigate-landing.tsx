'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { Button } from '@/components/ui/button'
import { Search, Terminal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function InvestigateLanding() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = address.trim()

    if (!trimmed) {
      setError('Enter a Solana wallet address')
      return
    }

    // Basic validation: Solana addresses are 32-44 chars base58
    if (trimmed.length < 32 || trimmed.length > 44) {
      setError('Invalid Solana address format')
      return
    }

    setError('')
    router.push(`/investigate/${trimmed}`)
  }

  return (
    <MainContentWrapper className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Terminal size={24} />
            <h1 className="font-mono text-2xl font-bold tracking-wider uppercase">
              Investigate
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm">
            Enter any Solana wallet address to explore its complete transaction
            history
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative group">
            <div className="absolute inset-0 rounded-md bg-primary/5 group-focus-within:bg-primary/10 group-focus-within:shadow-glow-md transition-all" />
            <div className="relative flex items-center">
              <Search
                size={18}
                className="absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  setError('')
                }}
                placeholder="Enter wallet address..."
                className="w-full h-14 pl-12 pr-32 bg-transparent border border-border/60 rounded-md font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
                autoFocus
                spellCheck={false}
              />
              <Button
                type="submit"
                className="absolute right-2 font-mono text-xs tracking-wider h-10"
              >
                Investigate
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-destructive font-mono text-xs pl-1">{error}</p>
          )}
        </form>

        {/* Example addresses */}
        <div className="space-y-2">
          <p className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-widest text-center">
            Try an example
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              {
                label: 'Toly',
                address: 'toly.sol',
                full: '86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdRrbukKM',
              },
              {
                label: 'Jupiter',
                address: 'JUP...gxbv',
                full: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
              },
            ].map((example) => (
              <button
                key={example.full}
                onClick={() => router.push(`/investigate/${example.full}`)}
                className="px-3 py-1.5 rounded-md border border-border/40 font-mono text-xs text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                {example.label}{' '}
                <span className="text-muted-foreground/40">
                  {example.address}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </MainContentWrapper>
  )
}
