import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const SolanaIcon = () => (
  <svg
    width="42"
    height="42"
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
    }}
  >
    <rect width="41" height="41" rx="20.5" fill="#000" x=".5" y=".5" />
    <rect width="41" height="41" rx="20.5" stroke="#333" x=".5" y=".5" />
    <g fill="#fff">
      <path d="m14.2503 24.9644c.1223-.1223.2883-.191.4613-.191h15.9615c.2907 0 .4363.3516.2306.5571l-3.154 3.1515c-.1223.1223-.2883.191-.4613.191h-15.9615c-.2907 0-.4363-.3516-.2306-.5572z" />
      <path d="m14.2503 13.191c.1223-.1223.2883-.191.4613-.191h15.9615c.2907 0 .4363.3516.2306.5571l-3.154 3.1515c-.1223.1222-.2883.1909-.4613.1909h-15.9615c-.2907 0-.4363-.3515-.2306-.5571z" />
      <path d="m27.7497 19.0401c-.1223-.1223-.2883-.191-.4613-.191h-15.9615c-.2907 0-.4363.3516-.2306.5571l3.154 3.1515c.1223.1223.2883.191.4613.191h15.9615c.2907 0 .4363-.3517.2306-.5572z" />
    </g>
  </svg>
)

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
            position: 'relative',
          }}
        >
          <SolanaIcon />
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
