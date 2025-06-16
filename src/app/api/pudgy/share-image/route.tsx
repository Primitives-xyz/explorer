/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

async function getImageData(url: string) {
  try {
    const response = await fetch(url)
    const contentType = response.headers.get('content-type') || ''
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Error fetching image:', error)
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const avatar = searchParams.get('avatar')
    const username = searchParams.get('username')
    const description = searchParams.get('description') ?? ''
    const pudgyTheme = searchParams.get('pudgyTheme') ?? 'blue'

    if (!username || !avatar) {
      throw new Error('Username and avatar are required')
    }

    const avatarUrl = await getImageData(decodeURIComponent(avatar))

    const url = new URL(req.url)
    const backgroundImageUrl = `${url.protocol}//${url.host}/images/pudgy/pudgy-share-bg-${pudgyTheme}.png`
    const buttonImageUrl = `${url.protocol}//${url.host}/images/pudgy/pudgy-share-button.png`

    const fontTTTrailers = await fetch(
      new URL('./fonts/tt-trailers-extrabold.otf', import.meta.url)
    ).then((res) => res.arrayBuffer())
    const fontMenco = await fetch(
      new URL('./fonts/menco-bold.otf', import.meta.url)
    ).then((res) => res.arrayBuffer())

    const size = 800

    const response = new ImageResponse(
      (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '32px',
            overflow: 'hidden',
          }}
        >
          <img
            src={backgroundImageUrl}
            alt="Background"
            width={size}
            height={size}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${size}px`,
              height: `${size}px`,
              objectFit: 'cover',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            {!!avatarUrl && (
              <img
                src={avatarUrl}
                alt={username || 'Profile'}
                width="200"
                height="200"
                style={{
                  borderRadius: '9999px',
                  objectFit: 'cover',
                  border: '3px solid #00142D',
                }}
              />
            )}
            <p
              style={{
                fontSize: '50px',
                color: '#ffffff',
                margin: 0,
                padding: 0,
                fontFamily: 'TT Trailers',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              @{username}
            </p>
          </div>

          <p
            style={{
              fontSize: '32px',
              margin: '0 auto',
              color: '#ffffff',
              textAlign: 'center',
              padding: '32px 0',
              maxWidth: '500px',
              fontFamily: 'Menco',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-1.1%',
            }}
          >
            {description}
          </p>
          <img
            src={buttonImageUrl}
            alt="Button"
            width={350}
            height={70}
            style={{
              width: '350px',
              height: '70px',
            }}
          />
        </div>
      ),
      {
        width: size,
        height: size,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=300, s-maxage=300',
        },
        fonts: [
          {
            name: 'TT Trailers',
            data: fontTTTrailers,
            style: 'normal',
            weight: 800,
          },
          {
            name: 'Menco',
            data: fontMenco,
            style: 'normal',
            weight: 700,
          },
        ],
      }
    )

    return response
  } catch (e) {
    console.error('Error generating image:', e)

    return new Response(
      'Failed to generate Pudgy x SSE Profile image: ' + (e as Error).message,
      {
        status: 500,
        headers: {
          'content-type': 'text/plain',
        },
      }
    )
  }
}
