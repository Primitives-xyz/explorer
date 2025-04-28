import { NextResponse } from 'next/server'

import { TWITTER_REDIRECT_URL } from '@/utils/constants'
export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { message: 'Authorization code is required' },
        { status: 400 }
      )
    }

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const redirectUrl = `${protocol}://${host}${TWITTER_REDIRECT_URL}`

    if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
      return NextResponse.json(
        { message: 'Twitter client ID or client secret is not configured' },
        { status: 500 }
      )
    }

    const basicAuth = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
    ).toString('base64')

    // Exchange code for access token
    const tokenUrl = 'https://api.twitter.com/2/oauth2/token'
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUrl,
        code_verifier: 'challenge', // This should match what you used in the authorization request
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Twitter token error:', errorData)
      return NextResponse.json(
        { message: 'Failed to exchange code for token' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()
    return NextResponse.json(tokenData)
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
