'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Import leaflet.heat side-effect
import 'leaflet.heat'

interface LocationPoint {
  lat: number
  lng: number
  weight: number
  username: string
  locationLabel?: string
}

interface Props {
  onLocationClick?: (lat: number, lng: number) => void
}

// Extend L to include heatLayer
declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: any
  ): any
}

function HeatmapLayer({ locations }: { locations: LocationPoint[] }) {
  const map = useMap()
  const heatLayerRef = useRef<any>(null)

  useEffect(() => {
    if (!locations.length) return

    const points: [number, number, number][] = locations.map((loc) => [
      loc.lat,
      loc.lng,
      loc.weight || 0.5,
    ])

    // Remove existing layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current)
    }

    // Create heatmap with green gradient
    heatLayerRef.current = L.heatLayer(points, {
      radius: 25,
      blur: 20,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.0: 'rgba(0, 30, 10, 0)',
        0.2: 'rgba(0, 80, 30, 0.3)',
        0.4: 'rgba(20, 140, 60, 0.5)',
        0.6: 'rgba(40, 180, 80, 0.7)',
        0.8: 'rgba(80, 220, 120, 0.85)',
        1.0: 'rgba(150, 255, 170, 1)',
      },
    }).addTo(map)

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
      }
    }
  }, [locations, map])

  return null
}

function MapClickHandler({
  onLocationClick,
}: {
  onLocationClick?: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click: (e) => {
      if (onLocationClick) {
        onLocationClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export function CommunityMap({ onLocationClick }: Props) {
  const [locations, setLocations] = useState<LocationPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch('/api/location/heatmap')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setLocations(data)
          }
        }
      } catch (e) {
        console.error('Failed to fetch heatmap data:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchLocations()
  }, [])

  return (
    <div className="relative w-full h-[500px] rounded-md overflow-hidden border border-border/30">
      {/* Custom CSS for dark Leaflet theme */}
      <style jsx global>{`
        .leaflet-container {
          background: hsl(160deg 15% 4%) !important;
          font-family: var(--font-jetbrains-mono), monospace !important;
        }
        .leaflet-control-zoom a {
          background: hsl(160deg 12% 8%) !important;
          color: hsl(142deg 70% 45%) !important;
          border-color: hsl(150deg 15% 18% / 0.6) !important;
        }
        .leaflet-control-zoom a:hover {
          background: hsl(142deg 70% 45% / 0.1) !important;
        }
        .leaflet-control-attribution {
          background: hsl(160deg 15% 4% / 0.8) !important;
          color: hsl(150deg 10% 40%) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: hsl(142deg 70% 45% / 0.6) !important;
        }
      `}</style>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={true}
        minZoom={2}
        maxZoom={12}
      >
        {/* CartoDB Dark Matter - dark tiles for terminal theme */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Heatmap layer */}
        <HeatmapLayer locations={locations} />

        {/* Click handler */}
        <MapClickHandler onLocationClick={onLocationClick} />
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-[1000]">
          <div className="text-center space-y-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse mx-auto" />
            <p className="font-mono text-xs text-muted-foreground">
              Loading community data...
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && locations.length === 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 border border-border/30 rounded-md px-3 py-2">
          <p className="font-mono text-[10px] text-muted-foreground">
            No locations yet. Be the first to set yours!
          </p>
        </div>
      )}

      {/* Location count */}
      {!loading && locations.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 border border-border/30 rounded-md px-3 py-2">
          <p className="font-mono text-[10px] text-primary/70">
            {locations.length} users on the map
          </p>
        </div>
      )}
    </div>
  )
}
