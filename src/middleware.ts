import { importSPKI, jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

interface JWTPayload {
  sub?: string
  role?: string
  [key: string]: unknown
}

// Function to detect if request is from a blink client
function isBlinkRequest(request: NextRequest): boolean {
  const accept = request.headers.get('accept') || ''

  // Blink clients request JSON and don't accept HTML
  return accept.includes('application/json') && !accept.includes('text/html')
}

// Function to check if a path looks like a username (not an API route, static file, etc.)
function isUsernameRoute(pathname: string): boolean {
  // Skip if it's an API route, static file, or other system routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    pathname === '/' ||
    pathname.startsWith('/trade/') ||
    pathname.startsWith('/discover/') ||
    pathname.startsWith('/stake/') ||
    pathname.startsWith('/namespace/') ||
    pathname.startsWith('/design-system/') ||
    pathname.startsWith('/leaderboard/') ||
    pathname.startsWith('/swap/') ||
    pathname.startsWith('/x/') ||
    pathname.startsWith('/trenches/')
  ) {
    return false
  }

  // Extract the potential username (remove leading slash and any @ symbol)
  const username = pathname.slice(1).replace(/^@/, '')

  // Check if it looks like a username (alphanumeric, underscores, 3-30 chars)
  return /^[a-zA-Z0-9_]{3,30}$/.test(username)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle authentication for protected routes first
  if (pathname === '/api/profiles/create' || pathname === '/api/comments') {
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

  // Skip API routes - let them be handled by their route handlers
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Handle blink requests for username routes
  if (isBlinkRequest(request) && isUsernameRoute(pathname)) {
    // For direct username routes like /alice, rewrite to the new action endpoint
    const username = pathname.slice(1).replace(/^@/, '')
    const actionUrl = new URL(`/api/actions/${username}`, request.url)
    return NextResponse.rewrite(actionUrl)
  }

  // Let other requests continue normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected API routes
    '/api/profiles/create',
    '/api/comments',
    // All other API routes (for processing, not auth)
    '/api/:path*',
    // Potential username routes
    '/((?!_next/|_static/|favicon.ico|.*\\.).*)',
  ],
}

const productionPublicKeys = process.env.DYNAMIC_KEY || ''
