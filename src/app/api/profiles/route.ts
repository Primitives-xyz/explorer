// app/api/profiles/findAllProfiles/route.ts

import { NextResponse } from 'next/server'

const BASE_URL = process.env.TAPESTRY_URL
const API_KEY = process.env.TAPESTRY_API_KEY

export async function GET(request: Request) {
  console.log('--- /api/profiles HIT ---');
  console.log('request.url:', request.url);
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('walletAddress')
  const useIdentities = searchParams.get('useIdentities') === 'true'
  const namespace = searchParams.get('namespace')
  const sortBy = searchParams.get('sortBy')
  const pageSize = searchParams.get('pageSize')
  try {
    if (useIdentities) {
      // For related profiles, use identities endpoint
      if (!walletAddress) {
        return NextResponse.json({ profiles: [] })
      }

      const identitiesResponse = await fetch(
        `${BASE_URL}/profiles?apiKey=${API_KEY}&walletAddress=${walletAddress}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
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
      const transformedIdentities = identitiesData.identities.map(
        (identity: any) => ({
          profile: {
            id: identity.profile.id,
            created_at: identity.profile.created_at,
            namespace: identity.profile.namespace,
            username: identity.profile.username,
            bio: identity.profile.bio || null,
            image: identity.profile.image || null,
          },
          wallet: {
            address: identity?.wallet?.address,
          },

          namespace: {
            name: identity.profile.namespace,
            readableName: identity.namespace.readableName,
            userProfileURL: identity.namespace.userProfileURL,
            faviconURL: identity.namespace.faviconURL,
          },
        })
      )

      return NextResponse.json({ profiles: transformedIdentities })
    } else {
      // For regular profile fetching, use profiles endpoint
      // TODO: shouldIncludeExternalProfiles was deprecated and no longer exists in tapestry. It should get from the identities.

      let url = `${BASE_URL}/profiles?apiKey=${API_KEY}`

      if (!!walletAddress) {
        url = `${url}&walletAddress=${walletAddress}&shouldIncludeExternalProfiles=true`
      }

      if (!!namespace) {
        url = `${url}&namespace=${namespace}`
      }

      if (!!sortBy) {
        url = `${url}&sortBy=${sortBy}`
      }

      if (!!pageSize) {
        url = `${url}&pageSize=${pageSize}`
      }

      console.log('url', url)

      const response = await fetch(url, {
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
          { status: response.status }
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
