import { verifyRequestAuth } from '@/utils/auth'
import { FetchMethod } from '@/utils/api/api.models'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import redis from '@/utils/redis'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/location/update
 * Updates the authenticated user's location in their Tapestry profile.
 * Body: { latitude: number, longitude: number, locationLabel: string }
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const payload = await verifyRequestAuth(request.headers)
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { latitude, longitude, locationLabel, username } = body

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // First, get the user's profile to get the ID
    const profile = await fetchTapestryServer({
      endpoint: `profiles/new/${username}?namespace=${EXPLORER_NAMESPACE}`,
      method: FetchMethod.GET,
    })

    if (!profile?.id) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Update the Tapestry profile with location properties
    await fetchTapestryServer({
      endpoint: `profiles/${profile.id}`,
      method: FetchMethod.PUT,
      data: {
        properties: [
          { key: 'latitude', value: String(latitude) },
          { key: 'longitude', value: String(longitude) },
          { key: 'locationLabel', value: locationLabel || '' },
        ],
      },
    })

    // Invalidate heatmap cache so it refreshes
    try {
      await redis.del('heatmap:locations')
      // Also update individual user location cache
      await redis.setex(
        `user:location:${username}`,
        3600,
        JSON.stringify({ latitude, longitude, locationLabel })
      )
    } catch (e) {
      console.warn('Redis cache invalidation error:', e)
    }

    return NextResponse.json({
      success: true,
      location: { latitude, longitude, locationLabel },
    })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}
