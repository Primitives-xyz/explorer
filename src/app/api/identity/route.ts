import { NextResponse } from 'next/server'

const BASE_URL = process.env.TAPESTRY_URL
const API_KEY = process.env.TAPESTRY_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('walletAddress')

  if (!walletAddress) {
    return NextResponse.json({ profiles: [] })
  }

  try {
    const identitiesResponse = await fetch(
      `${BASE_URL}/identities/${walletAddress}?apiKey=${API_KEY}&page=0&pageSize=20`,
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
          address: identity.walletAddress,
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
  } catch (error) {
    console.error('Error fetching identities from Tapestry:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
