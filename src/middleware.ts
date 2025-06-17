import { decodeProtectedHeader, importJWK, jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

interface IDynamicPublicKeyResponse {
  keys: {
    n: string
    alg: string
    kty: string
    use: string
    e: string
    kid: string
  }[]
}

interface JWTPayload {
  sub?: string
  role?: string
  [key: string]: unknown
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Handle preflight requests immediately
  if (request.method === 'OPTIONS') {
    return response
  }

  const authToken = request.headers.get('Authorization')
  const jwt = authToken?.split(' ')[1]

  if (!jwt) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const dynamicEnvironmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID

  if (!dynamicEnvironmentId) {
    return NextResponse.json(
      { error: 'Dynamic environment ID is not set' },
      { status: 401 }
    )
  }

  const dynamicPublicKeyResponse = await fetch(
    `https://app.dynamic.xyz/api/v0/sdk/${dynamicEnvironmentId}/.well-known/jwks`
  )
  const dynamicPublicKeyData =
    (await dynamicPublicKeyResponse.json()) as IDynamicPublicKeyResponse

  // Decode JWT header to get the key ID (kid)
  let jwtHeader
  try {
    jwtHeader = decodeProtectedHeader(jwt)
  } catch (error) {
    console.error('Failed to decode JWT header:', error)
    return NextResponse.json({ error: 'Invalid JWT format' }, { status: 401 })
  }

  // Find the matching key based on kid
  const matchingKey = dynamicPublicKeyData.keys?.find(
    (key) => key.kid === jwtHeader.kid
  )

  if (!matchingKey) {
    console.error('No matching key found for kid:', jwtHeader.kid)
    return NextResponse.json(
      { error: 'No matching verification key found' },
      { status: 401 }
    )
  }

  try {
    const publicKey = await importJWK(matchingKey)

    const { payload } = await jwtVerify(jwt, publicKey, {
      algorithms: [matchingKey.alg],
    })

    const verifiedToken = payload as unknown as JWTPayload

    if (verifiedToken.sub) {
      response.headers.set('x-user-id', verifiedToken.sub)
    }

    return response
  } catch (error) {
    console.error('Token verification failed: ', error)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: ['/api/profiles/create', '/api/comments'],
}
