// app/api/profiles/findAllProfiles/route.ts

import { NextResponse } from 'next/server'

const BASE_URL = process.env.TAPESTRY_URL
const API_KEY = process.env.TAPESTRY_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('walletAddress')
  const useIdentities = searchParams.get('useIdentities') === 'true'

  try {
    if (useIdentities) {
      // For related profiles, use identities endpoint
      if (!walletAddress) {
        return NextResponse.json({ profiles: [] })
      }

      const identitiesResponse = await fetch(
        `${BASE_URL}/identities/${walletAddress}?apiKey=${API_KEY}&page=0&pageSize=20`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
      )

      if (!identitiesResponse.ok) {
        console.error('IDENTITIES Tapestry API Error: ', {
          status: identitiesResponse.status,
          statusText: identitiesResponse.statusText,
          error: await identitiesResponse.text(),
          walletAddress,
        })
        return NextResponse.json({ profiles: [] })
      }

      const identitiesData = await identitiesResponse.json()
      // Transform identities data to match profiles shape
      const transformedIdentities = identitiesData.map((identity: any) => ({
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
      }))

      return NextResponse.json({ profiles: transformedIdentities })
    } else {
      // For regular profile fetching, use profiles endpoint
      const apiUrl = walletAddress
        ? `${BASE_URL}/profiles?apiKey=${API_KEY}&walletAddress=${walletAddress}&shouldIncludeExternalProfiles=true`
        : `${BASE_URL}/profiles?apiKey=${API_KEY}`

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('PROFILE Tapestry API Error: ', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          walletAddress,
        })
        return NextResponse.json(
          { error: 'Failed to fetch profiles from Tapestry' },
          { status: response.status },
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Error fetching from Tapestry:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
