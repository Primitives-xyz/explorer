// app/api/profiles/findAllProfiles/route.ts

import { NextResponse } from 'next/server'

const BASE_URL = process.env.TAPESTRY_URL
const API_KEY = process.env.TAPESTRY_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('walletAddress')

  try {
    const apiUrl = walletAddress
      ? `${BASE_URL}/profiles?apiKey=${API_KEY}&walletAddress=${walletAddress}`
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
        { status: response.status }
      )
    }


    const identitiesData = await response.json()

    // Transform identities data to match profiles shape
    const transformedIdentities = identitiesData.identities.flatMap((identity: any) => 
      identity.profiles.map((elem: any) => ({
        profile: {
          id: elem.profile.id,
          created_at: elem.profile.created_at,
          namespace: elem.profile.namespace,
          username: elem.profile.username,
          bio: elem.profile.bio || null,
          image: elem.profile.image || null,
        },
        wallet: {
          address: identity.wallet.address, 
        },
        namespace: {
          name: elem.namespace?.name,
          readableName: elem.namespace?.readableName,
          userProfileURL: elem.namespace?.userProfileURL,
          faviconURL: elem.namespace?.faviconURL,
        },
      }))
    );
    return NextResponse.json({profiles: transformedIdentities})

        
  } catch (error) {
    console.error('Error fetching from Tapestry:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
