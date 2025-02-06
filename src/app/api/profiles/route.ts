// app/api/profiles/findAllProfiles/route.ts

import { NextResponse } from 'next/server'

const BASE_URL = process.env.TAPESTRY_URL
const API_KEY = process.env.TAPESTRY_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('walletAddress')

  try {
    // Call both endpoints in parallel
    const [profilesResponse, identitiesResponse] = await Promise.all([
      // Original profiles endpoint
      fetch(
        walletAddress
          ? `${BASE_URL}/profiles?apiKey=${API_KEY}&walletAddress=${walletAddress}&shouldIncludeExternalProfiles=true`
          : `${BASE_URL}/profiles?apiKey=${API_KEY}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
      ),
      // New identities endpoint - using walletAddress as the id
      walletAddress
        ? fetch(
            `${BASE_URL}/identities/${walletAddress}?apiKey=${API_KEY}&page=0&pageSize=20`,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
              },
            },
          )
        : Promise.resolve(null),
    ])

    const results: any = {}

    // Handle profiles response
    if (!profilesResponse.ok) {
      console.error('PROFILE Tapestry API Error: ', {
        status: profilesResponse.status,
        statusText: profilesResponse.statusText,
        error: await profilesResponse.text(),
        walletAddress,
      })
    } else {
      const profilesData = await profilesResponse.json()
      results.profiles = profilesData.profiles || []
      console.log('=== PROFILES ENDPOINT RESPONSE ===')
      console.log('Shape:', JSON.stringify(Object.keys(profilesData), null, 2))
      console.log('Full data:', JSON.stringify(profilesData, null, 2))
      console.log('================================')
    }

    // Handle identities response
    if (identitiesResponse) {
      if (!identitiesResponse.ok) {
        console.error('IDENTITIES Tapestry API Error: ', {
          status: identitiesResponse.status,
          statusText: identitiesResponse.statusText,
          error: await identitiesResponse.text(),
          walletAddress,
        })
      } else {
        const identitiesData = await identitiesResponse.json()
        // Transform identities data to match profiles shape
        const transformedIdentities = {
          profiles: identitiesData.map((identity: any) => ({
            profile: {
              id: identity.id,
              created_at: identity.created_at,
              namespace: identity.namespace,
              username: identity.username,
              bio: identity.bio || null,
              image: identity.image || null,
            },
            wallet: {
              address: identity.blockchain === 'SOLANA' ? identity.id : null,
            },
            namespace: {
              name: identity.namespace,
              readableName: identity.namespace,
              userProfileURL: '',
              faviconURL: null,
            },
          })),
          page: 1,
          pageSize: identitiesData.length,
        }

        // Combine profiles from both endpoints
        results.profiles = [
          ...(results.profiles || []),
          ...transformedIdentities.profiles,
        ]
      }
    }

    return NextResponse.json({ profiles: results.profiles })
  } catch (error) {
    console.error('Error fetching from Tapestry:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
