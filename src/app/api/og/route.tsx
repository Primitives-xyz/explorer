import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title')
    const description = searchParams.get('description')
    const image = searchParams.get('image')

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#030711',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgb(22 163 74)',
              borderRadius: '16px',
              padding: '40px',
              background: 'rgba(22, 163, 74, 0.1)',
              width: '100%',
              height: '100%',
            }}
          >
            {image && (
              <img
                src={image}
                alt={title || 'Profile Image'}
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '70px',
                  marginBottom: '20px',
                  objectFit: 'cover',
                }}
              />
            )}

            {/* Title */}
            <div
              style={{
                fontSize: 60,
                fontFamily: 'monospace',
                color: '#4ade80',
                marginBottom: '10px',
                textAlign: 'center',
                maxWidth: '900px',
                wordWrap: 'break-word',
              }}
            >
              {title || 'Explorer'}
            </div>

            {/* Description */}
            {description && (
              <div
                style={{
                  fontSize: 30,
                  fontFamily: 'monospace',
                  color: '#22c55e',
                  textAlign: 'center',
                  maxWidth: '800px',
                  wordWrap: 'break-word',
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e) {
    console.error(e)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
