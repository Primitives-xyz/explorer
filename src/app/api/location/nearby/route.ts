import redis from '@/utils/redis'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/location/nearby?lat=X&lng=Y&radius=50
 * Returns users near the given coordinates.
 * Reads from the heatmap cache and filters by distance.
 */

interface LocationPoint {
  lat: number
  lng: number
  weight: number
  username: string
  image?: string | null
  locationLabel?: string
}

// Haversine distance in km
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const radius = parseFloat(searchParams.get('radius') || '50') // km

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'lat and lng are required' },
      { status: 400 }
    )
  }

  try {
    // Read from heatmap cache
    const cached = await redis.get('heatmap:locations')
    if (!cached) {
      // If no cache, return empty - client should call /api/location/heatmap first
      return NextResponse.json([])
    }

    const locations: LocationPoint[] =
      typeof cached === 'string' ? JSON.parse(cached) : (cached as LocationPoint[])

    // Filter by distance
    const nearby = locations
      .map((loc) => ({
        ...loc,
        distance: haversineDistance(lat, lng, loc.lat, loc.lng),
      }))
      .filter((loc) => loc.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50) // Limit to 50 nearby users

    return NextResponse.json(nearby, {
      headers: {
        'Cache-Control': 'public, s-maxage=60',
      },
    })
  } catch (error) {
    console.error('Error fetching nearby users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nearby users' },
      { status: 500 }
    )
  }
}
