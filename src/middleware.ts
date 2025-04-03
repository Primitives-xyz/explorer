import { importSPKI, jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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

  const DYNAMIC_KEY = process.env.DYNAMIC_KEY || productionPublicKeys

  try {
    const publicKey = await importSPKI(DYNAMIC_KEY, 'RS256')

    const { payload } = await jwtVerify(jwt as string, publicKey, {
      algorithms: ['RS256'],
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

const productionPublicKeys = process.env.DYNAMIC_KEY || ''
