import { NextResponse } from 'next/server'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { FetchMethod } from '@/utils/api'

export async function GET(request: Request) {
  try {
    // Get the access token from the request headers
    const authHeader = request.headers.get('Authorization')
    const { searchParams } = new URL(request.url)
    const profile = searchParams.get('profile')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header is required' }, { status: 401 })
    }
    
    const accessToken = authHeader.split(' ')[1]
    
    // Fetch user data from Twitter API
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      // Include necessary fields in the request
      // This is Twitter API v2 with query parameters to expand user fields
      next: { 
        revalidate: 0,
        tags: ['twitter-user'],
      },
    })
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json()
      console.error('Twitter user API error:', errorData)
      return NextResponse.json({ message: 'Failed to fetch user data' }, { status: 400 })
    }
    
    const userData = await userResponse.json()
    
    await fetchTapestryServer({
      endpoint: `profiles/${profile}/contacts`,
      method: FetchMethod.PATCH,
      data: [
      {data: {
        "id": userData.data.username,
        "type": "TWITTER"
      },
      proof: ''}],
    })
    
    return NextResponse.json(userData)
  } catch (error) {
    console.error('User data fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}