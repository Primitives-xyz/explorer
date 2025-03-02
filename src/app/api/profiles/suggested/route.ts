// app/api/profiles/suggestedProfiles/route.ts
import { FetchMethod, fetchTapestry, type Profile } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'

interface SuggestedProfilesResponse {
  profiles: Profile[]
  error?: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const walletAddress = searchParams.get('walletAddress')

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Owner wallet address is required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetchTapestry<SuggestedProfilesResponse>({
      endpoint: `profiles/suggested/${walletAddress}`,
      method: FetchMethod.GET,
    })

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 500 })
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching suggested profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch suggested profiles' },
      { status: 500 }
    )
  }
}
