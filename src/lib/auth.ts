import { importSPKI, jwtVerify } from 'jose'

// Using the same public key from middleware
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
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

export interface JWTPayload {
  sub?: string
  role?: string
  [key: string]: unknown
}

export async function verifyAuthToken(
  token: string,
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
