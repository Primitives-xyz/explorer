import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import redis from '@/utils/redis'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/location/heatmap
 * Returns all user locations for the heatmap display.
 * Uses Redis cache with 5-minute TTL, rebuilt from Tapestry on miss.
 */

const HEATMAP_CACHE_KEY = 'heatmap:locations'
const HEATMAP_CACHE_TTL = 300 // 5 minutes

interface LocationPoint {
  lat: number
  lng: number
  weight: number
  username: string
  image?: string | null
  locationLabel?: string
}

export async function GET(request: NextRequest) {
  // Check Redis cache first
  try {
    const cached = await redis.get(HEATMAP_CACHE_KEY)
    if (cached) {
      const data = typeof cached === 'string' ? JSON.parse(cached) : cached
      return NextResponse.json(data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=60',
        },
      })
    }
  } catch (e) {
    console.warn('Redis heatmap cache error:', e)
  }

  try {
    // Fetch all profiles from Tapestry that have location data
    // We paginate through all profiles in the namespace
    const locations: LocationPoint[] = []
    let page = 1
    const pageSize = 100
    let hasMore = true

    while (hasMore) {
      try {
        const result = await fetchTapestryServer<any>({
          endpoint: `profiles?namespace=${EXPLORER_NAMESPACE}&pageSize=${pageSize}&page=${page}`,
        })

        const profiles = result?.profiles || result || []

        if (!Array.isArray(profiles) || profiles.length === 0) {
          hasMore = false
          break
        }

        for (const profile of profiles) {
          const lat = parseFloat(profile.latitude)
          const lng = parseFloat(profile.longitude)

          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            locations.push({
              lat,
              lng,
              weight: 1,
              username: profile.username,
              image: profile.image || null,
              locationLabel: profile.locationLabel || '',
            })
          }
        }

        if (profiles.length < pageSize) {
          hasMore = false
        } else {
          page++
        }

        // Safety limit to prevent infinite loops
        if (page > 50) {
          hasMore = false
        }
      } catch (e) {
        console.error('Error fetching profiles page:', page, e)
        hasMore = false
      }
    }

    // Cache in Redis
    try {
      await redis.setex(
        HEATMAP_CACHE_KEY,
        HEATMAP_CACHE_TTL,
        JSON.stringify(locations)
      )
    } catch (e) {
      console.warn('Redis heatmap cache write error:', e)
    }

    return NextResponse.json(locations, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=60',
      },
    })
  } catch (error) {
    console.error('Error fetching heatmap data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    )
  }
}
