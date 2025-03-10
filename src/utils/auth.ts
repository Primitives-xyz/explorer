import { importSPKI, jwtVerify } from 'jose'

// Using the same public key from middleware
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? ''

export interface JWTPayload {
  sub?: string
  role?: string
  [key: string]: unknown
}

export async function verifyAuthToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const publicKey = await importSPKI(PUBLIC_KEY, 'RS256')
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
    })

    return payload as JWTPayload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}
