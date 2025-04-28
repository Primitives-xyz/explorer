import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Get the access token from the request headers
    const authHeader = request.headers.get('Authorization')
    const { searchParams } = new URL(request.url)
    const profile = searchParams.get('profile')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization header is required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.split(' ')[1]

    // Fetch user data from Twitter API
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 0,
        tags: ['twitter-user'],
      },
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.json()
      console.error('Twitter user API error:', errorData)
      return NextResponse.json(
        { message: 'Failed to fetch user data' },
        { status: 400 }
      )
    }

    const userData = await userResponse.json()

    const userId = userData.data.id

    // Fetch user tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at,text`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 0,
          tags: ['twitter-tweets'],
        },
      }
    )

    if (!tweetsResponse.ok) {
      const errorData = await tweetsResponse.json()
      console.error('Twitter tweets API error:', errorData)
      return NextResponse.json(
        { message: 'Failed to fetch tweets' },
        { status: 400 }
      )
    }

    const tweetsData = await tweetsResponse.json()

    await fetchTapestryServer({
      endpoint: `profiles/${profile}/contacts`,
      method: FetchMethod.PATCH,
      data: [
        {
          data: {
            id: userData.data.username,
            type: 'TWITTER',
          },
          proof: '',
        },
      ],
    })

    return NextResponse.json({
      user: userData.data,
      tweets: tweetsData.data,
    })
  } catch (error) {
    console.error('User data fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
