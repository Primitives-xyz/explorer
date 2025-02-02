// app/api/profiles/findAllProfiles/route.ts

import { NextResponse } from 'next/server'

const BASE_URL = process.env.TAPESTRY_URL
const API_KEY = process.env.TAPESTRY_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('walletAddress')

  // Construct URL based on whether walletAddress is provided
  const apiUrl = walletAddress
    ? `${BASE_URL}/profiles?apiKey=${API_KEY}&walletAddress=${walletAddress}&shouldIncludeExternalProfiles=true`
    : `${BASE_URL}/profiles?apiKey=${API_KEY}`

  try {
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
  } catch (error) {
    console.error('Error fetching from Tapestry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 },
    )
  }
}
