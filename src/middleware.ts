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
      { status: 401 },
    )
  }

  const PUBLIC_KEY = productionPublicKeys
  try {
    const publicKey = await importSPKI(PUBLIC_KEY, 'RS256')
    console.log('Attempting verification with working key...', jwt)
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
      { status: 401 },
    )
  }
}

export const config = {
  matcher: ['/api/profiles/create'],
}

const productionPublicKeys = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwrZbf3IEzHI2Tc+exxnG
RDLdmo0kN4mAxcxRnwZazJ398SCc6P6KBWaYMFQUrGRGYUhjGmcum7S6tqYkC986
ym4O4t/Mn3rbMD7FYFsYaUWqyliHtqkqd0C4yTZnXwdxCVythIdzcQkSzwIqQiEp
54P6ueJBO3WewNDgx5c1mUZIkYh+eWRHmcCIY63AOdYS5Jn3NT6YScorO35PGiBK
V7pYGsPC+CLjeVNGO7KOcQDYGk2tRhqSmu1DwZqmJJt8iLOKwCq0jkX0JSThjSLb
qbVUHrI7llIYBySLspViig0h3rkgIqcIxikavJNrKqqqe+9nAx1Y1ufUZuo+pQjj
oqw0dZ7npRCjqeocm6WVgwOavunLDSXitFC4HXxlEcPfUZVU725U2cofIs8wSoxj
5DpS2FBx2aOG4selH0EGW1h6ifDx/Jpk7oZWY9ifOJSpWjCrojGPawD2Dj8Lm+QW
J8/OgjzalEBt7zq4izutIyIxeDrRonD2iJm/PnnLkfyNqUKHAdN++AfOeDZKuiJj
3a5L7K8PhbKDbtRQmYjPHWj/6icSJ9NUKD8QrzwWlDadcZhEa1/quXuIqGllF3XX
dlHpYWSZl9sKq8MdoooDRR+ZRZxgGarQ6hLg0RPVe+BwUY3yLxSmV2N2CkB0nQie
ehm15ZdHPujneQHiIWc3g8cCAwEAAQ==
-----END PUBLIC KEY-----`
