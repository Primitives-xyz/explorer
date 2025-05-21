'use client'

import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SocialsPage() {
  const params = useParams()
  const id = params?.id as string
  const [isClient, setIsClient] = useState(false)

  // Get the base URL for the blink
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://explorer.solana.com'

  // Generate blink URLs for different platforms
  const threadsBlinkUrl = `${baseUrl}/?action=solana-action%3A${encodeURIComponent(
    `${baseUrl}/api/actions/social/threads/nick_oxford`
  )}`
  const mastodonBlinkUrl = `${baseUrl}/?action=solana-action%3A${encodeURIComponent(
    `${baseUrl}/api/actions/social/mastodon/activitypub`
  )}`
  const sseBlinkUrl = `${baseUrl}/?action=solana-action%3A${encodeURIComponent(
    `${baseUrl}/api/actions/social/sse/${id}`
  )}`

  // Create URL just with username to show all platform options
  const userSocialsBlinkUrl = `${baseUrl}/?action=solana-action%3A${encodeURIComponent(
    `${baseUrl}/api/actions/social/${id}`
  )}`

  // Create URL without any parameters to show all options
  const allSocialsBlinkUrl = `${baseUrl}/?action=solana-action%3A${encodeURIComponent(
    `${baseUrl}/api/actions/social`
  )}`

  useEffect(() => {
    setIsClient(true)
  }, [])

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${platform} blink to clipboard!`)
  }

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Follow @{id} on social media</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">
            Individual Follow Links
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Threads</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(threadsBlinkUrl, 'Threads')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Follow @nick_oxford on Threads
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Mastodon</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(mastodonBlinkUrl, 'Mastodon')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Follow @activitypub on Mastodon
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Solana Explorer</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(sseBlinkUrl, 'SSE')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Follow @{id} on Solana Explorer
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">All Platform Options</h2>
          <p className="mb-4">
            Share this link to let people follow you on their preferred
            platform.
          </p>

          <div className="flex flex-col gap-4">
            <div className="p-4 bg-muted rounded-md overflow-hidden overflow-ellipsis break-all">
              <code className="text-xs">{userSocialsBlinkUrl}</code>
            </div>

            <Button
              className="w-full"
              onClick={() =>
                copyToClipboard(userSocialsBlinkUrl, 'User Socials')
              }
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy User Social Links Blink
            </Button>

            <hr className="my-2" />

            <p className="mt-2 mb-4">Generic follow blink (no username):</p>

            <div className="p-4 bg-muted rounded-md overflow-hidden overflow-ellipsis break-all">
              <code className="text-xs">{allSocialsBlinkUrl}</code>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => copyToClipboard(allSocialsBlinkUrl, 'All Socials')}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Generic Follow Blink
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-card rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4">What are Solana Blinks?</h2>
        <p className="text-muted-foreground">
          Blinks are blockchain links that allow anyone to interact with Solana
          without leaving the app or website they're currently using. When
          someone clicks a blink, their wallet can immediately show them what
          transaction they're about to make.
        </p>
      </div>
    </div>
  )
}
