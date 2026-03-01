'use client'

import { Avatar } from '@/components/ui/avatar/avatar'
import { route } from '@/utils/route'
import { MapPin, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface NearbyUser {
  lat: number
  lng: number
  username: string
  image?: string | null
  locationLabel?: string
  distance: number
}

interface Props {
  lat: number
  lng: number
  onClose: () => void
}

export function NearbyUsersPanel({ lat, lng, onClose }: Props) {
  const [users, setUsers] = useState<NearbyUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNearby() {
      try {
        const res = await fetch(
          `/api/location/nearby?lat=${lat}&lng=${lng}&radius=100`
        )
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setUsers(data)
          }
        }
      } catch (e) {
        console.error('Failed to fetch nearby users:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchNearby()
  }, [lat, lng])

  return (
    <div className="bg-card border border-border/30 rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <span className="font-mono text-xs font-bold tracking-wider text-foreground uppercase">
            Nearby Users
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            ({lat.toFixed(2)}, {lng.toFixed(2)})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-8">
            <p className="font-mono text-xs text-muted-foreground">
              No users found in this area
            </p>
          </div>
        )}

        {!loading &&
          users.map((user) => (
            <Link
              key={user.username}
              href={route('entity', { id: user.username })}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  username={user.username}
                  imageUrl={user.image}
                  size={28}
                  className="w-7"
                />
                <div>
                  <p className="font-mono text-xs text-foreground">
                    {user.username}
                  </p>
                  {user.locationLabel && (
                    <p className="font-mono text-[10px] text-muted-foreground/60">
                      {user.locationLabel}
                    </p>
                  )}
                </div>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {user.distance < 1
                  ? `${(user.distance * 1000).toFixed(0)}m`
                  : `${user.distance.toFixed(0)}km`}
              </span>
            </Link>
          ))}
      </div>
    </div>
  )
}
