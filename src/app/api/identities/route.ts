import { NextResponse } from 'next/server'

const BASE_URL = process.env.TAPESTRY_URL
const API_KEY = process.env.TAPESTRY_API_KEY

function processWalletRelatedProfile(identity: any, elem: any){
  return  {
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
  }}
}

function processContactRelatedProfile(elem: any) {
  return {
    profile: {
      id: elem.profile.id,
      created_at: elem.profile.created_at,
      namespace: elem.profile.namespace,
      username: elem.profile.username,
      bio: elem.profile.bio || null,
      image: elem.profile.image || null,
  },
  namespace: {
    name: elem.namespace?.name,
    readableName: elem.namespace?.readableName,
    userProfileURL: elem.namespace?.userProfileURL,
    faviconURL: elem.namespace?.faviconURL,
  }}
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('walletAddress')
  const ContactType = searchParams.get('ContactType')

  if (!walletAddress) {
    return NextResponse.json({ profiles: [] })
  }

  try {
    const identitiesResponse = await fetch(
      `${BASE_URL}/identities/${walletAddress}?apiKey=${API_KEY}&page=1&pageSize=20&contactType=${ContactType}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    )
    console.log("🚀 ~ GET ~ identitiesResponse:", identitiesResponse)
    
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
    console.log("🚀 ~ GET ~ identitiesData:", identitiesData)

    // Transform identities data to match profiles shape
    const transformedIdentities = identitiesData.identities.flatMap((identity: any) => 
      identity.profiles.map((elem: any) => {
        if(identity.wallet?.address) return processWalletRelatedProfile(identity, elem);
        if(identity.contact) return processContactRelatedProfile(elem);
        console.log('Unexpected type of identity can\'t process it. ', identity, elem);
        return null; 
      })
    );
    return NextResponse.json({profiles: transformedIdentities})
  } catch (error) {
    console.error('Error fetching identities from Tapestry:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
