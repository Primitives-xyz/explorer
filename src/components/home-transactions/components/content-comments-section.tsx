'use client'

import { Avatar } from '@/components/ui/avatar/avatar'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/form/input'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { getAuthToken } from '@dynamic-labs/sdk-react-core'
import Link from 'next/link'
import { useState } from 'react'
import { useContentComments } from '../hooks/use-content-comments'

export function CommentsSection({
  contentId,
  onAfterSubmit,
}: {
  contentId: string
  onAfterSubmit?: () => void
}) {
  const { mainProfile } = useCurrentWallet()
  const { comments, loading, refetch } = useContentComments({
    contentId,
    enabled: true,
  })
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    console.log('handleSubmit', text, mainProfile, mainProfile?.username)
    if (!text.trim() || !mainProfile?.username) return
    setSubmitting(true)
    try {
      const authToken = getAuthToken()
      await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          profileId: mainProfile.username,
          contentId,
          text: text.trim(),
        }),
      })
      setText('')
      await refetch()
      onAfterSubmit?.()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    const authToken = getAuthToken()
    await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    })
    await refetch()
  }

  return (
    <div className="w-full">
      {(loading || comments.length > 0) && (
        <div className="space-y-2 border rounded-lg p-2 bg-muted/40 w-full text-left">
          {loading ? (
            <div className="text-sm text-muted-foreground">
              Loading comments…
            </div>
          ) : (
            [...comments]
              .sort((a, b) => Number(a.created_at) - Number(b.created_at))
              .map((c, idx, arr) => (
                <div key={c.id} className="text-sm w-full">
                  <div className="flex items-start gap-2 py-1 w-full">
                    <Link
                      href={route('entity', { id: c.profile.username })}
                      className="shrink-0"
                    >
                      <Avatar
                        username={c.profile.username}
                        imageUrl={c.profile.image}
                        size={20}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Link
                          href={route('entity', { id: c.profile.username })}
                          className="font-medium hover:underline truncate"
                        >
                          @{c.profile.username}
                        </Link>
                        {mainProfile?.username === c.profile.username && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                      <p className="text-foreground/90 whitespace-pre-wrap break-words">
                        {c.text}
                      </p>
                    </div>
                  </div>
                  {idx < arr.length - 1 && <div className="h-px bg-border" />}
                </div>
              ))
          )}
        </div>
      )}
      {mainProfile?.username && (
        <div className="flex items-center gap-2 mt-3 w-full">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment"
            containerClassName="flex-1"
          />
          <Button disabled={!text.trim() || submitting} onClick={handleSubmit}>
            Comment
          </Button>
        </div>
      )}
    </div>
  )
}
