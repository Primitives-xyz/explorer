import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title')
    const description = searchParams.get('description')
    const image = searchParams.get('image')
    const followers = searchParams.get('followers') || '0'
    const following = searchParams.get('following') || '0'
    const wallet = searchParams.get('wallet') || ''

    // Convert DiceBear SVG URL to PNG URL
    let imageData = image
    if (image?.includes('dicebear')) {
      imageData =
        image
          .replace('/svg', '/png') // Change endpoint from SVG to PNG
          .replace('?seed=', '/') + // Change query param format
        '?size=180' // Add size parameter
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
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
              gap: '20px',
            }}
          >
            {imageData && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '100px',
                  border: '2px solid rgb(22 163 74)',
                  padding: '4px',
                  background: 'rgba(22, 163, 74, 0.1)',
                }}
              >
                <img
                  src={imageData}
                  alt={title || 'Profile Image'}
                  width="180"
                  height="180"
                  style={{
                    borderRadius: '90px',
                  }}
                />
              </div>
            )}

            {/* Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 60,
                fontFamily: 'monospace',
                color: '#4ade80',
                textAlign: 'center',
                maxWidth: '900px',
                wordWrap: 'break-word',
              }}
            >
              {title || 'Explorer'}
            </div>

            {/* Social Stats */}
            {(Number(followers) > 0 || Number(following) > 0) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                }}
              >
                {Number(followers) > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: '#22c55e',
                      fontSize: 24,
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ fontSize: 32, fontWeight: 'bold' }}>
                      {followers}
                    </span>
                    <span>followers</span>
                  </div>
                )}
                {Number(following) > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: '#22c55e',
                      fontSize: 24,
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ fontSize: 32, fontWeight: 'bold' }}>
                      {following}
                    </span>
                    <span>following</span>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Address */}
            {wallet && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontFamily: 'monospace',
                  color: '#22c55e',
                  opacity: 0.8,
                  textAlign: 'center',
                  maxWidth: '800px',
                  wordWrap: 'break-word',
                }}
              >
                {wallet.slice(0, 4)}...{wallet.slice(-4)}
              </div>
            )}

            {/* Description */}
            {description && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
