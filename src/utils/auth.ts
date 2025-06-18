import { importSPKI, jwtVerify } from 'jose'

// Using the same public key from middleware
const DYNAMIC_KEY = process.env.DYNAMIC_KEY ?? ''

export interface JWTPayload {
  sub?: string
  role?: string
  [key: string]: unknown
}

export async function verifyAuthToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const publicKey = await importSPKI(DYNAMIC_KEY, 'RS256')
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
    })

    return payload as JWTPayload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Extract and verify auth token from request headers
 * @param headers - The request headers
 * @returns The verified JWT payload or null if invalid/missing
 */
export async function verifyRequestAuth(
  headers: Headers
): Promise<JWTPayload | null> {
  const authHeader = headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  const token = parts[1]
  if (!token) {
    return null
  }

  return verifyAuthToken(token)
}

/**
 * Get user ID from verified token
 * @param verifiedToken - The verified JWT payload
 * @returns The user ID (sub) or null
 */
export function getUserIdFromToken(verifiedToken: JWTPayload): string | null {
  return verifiedToken.sub || null
}
