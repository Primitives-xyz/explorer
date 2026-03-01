'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { Globe, MapPin, Users } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { NearbyUsersPanel } from './nearby-users-panel'
import { SetLocationModal } from './set-location-modal'

// Dynamic import to avoid SSR issues with Leaflet
const CommunityMap = dynamic(() => import('./community-map').then(m => m.CommunityMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-card/50 border border-border/20 rounded-md flex items-center justify-center">
      <div className="text-center space-y-2">
        <Globe size={24} className="text-primary/40 mx-auto animate-pulse" />
        <p className="font-mono text-xs text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

export function MapPageContent() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [showSetLocation, setShowSetLocation] = useState(false)

  return (
    <MainContentWrapper className="pb-20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-primary" />
            <h1 className="font-mono text-sm font-bold tracking-wider text-primary uppercase">
              Community Map
            </h1>
          </div>
          <button
            onClick={() => setShowSetLocation(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/5 font-mono text-xs text-primary hover:bg-primary/10 transition-colors"
          >
            <MapPin size={12} />
            Set My Location
          </button>
        </div>

        {/* Description */}
        <p className="font-mono text-xs text-muted-foreground">
          See where the Tapestry community is located around the world.
          Set your location to appear on the map and connect with nearby users.
        </p>

        {/* Map */}
        <div className="relative">
          <CommunityMap
            onLocationClick={(lat, lng) => {
              setSelectedLocation({ lat, lng })
            }}
          />
        </div>

        {/* Nearby Users */}
        {selectedLocation && (
          <NearbyUsersPanel
            lat={selectedLocation.lat}
            lng={selectedLocation.lng}
            onClose={() => setSelectedLocation(null)}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border/30 rounded-md px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users size={12} />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Community
              </span>
            </div>
            <p className="font-mono text-sm text-foreground/80">
              Click on the map to find nearby users
            </p>
          </div>
          <div className="bg-card border border-border/30 rounded-md px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={12} />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Your Location
              </span>
            </div>
            <p className="font-mono text-sm text-foreground/80">
              Self-reported, approximate
            </p>
          </div>
        </div>
      </div>

      {/* Set Location Modal */}
      {showSetLocation && (
        <SetLocationModal onClose={() => setShowSetLocation(false)} />
      )}
    </MainContentWrapper>
  )
}
