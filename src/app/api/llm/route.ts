import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let transactionText = searchParams.get('text')
    let API_KEY = process.env.ANTHROPIC_API_KEY

    if (!API_KEY) {
      throw 'Anthropic API key missing.'
    }
    const headers = new Headers()
    headers.append('Accept', 'application/json')
    headers.append('anthropic-version', '2023-06-01')
    headers.append('x-api-key', API_KEY)

    const response = await fetch(`https://api.anthropic.com/v1/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Explain this transaction to a solana trader: ${transactionText}`,
          },
        ],
      }),
    })

    let body = await response.json()
    if (body?.content[0]?.text) {
      return NextResponse.json({ text: body?.content[0]?.text })
    }

    throw `Invalid response from Anthropic: ${body}`
  } catch (error) {
    console.error('Unable to get the LLM response:', error)
    return NextResponse.json(
      { error: 'Failed to get an LLM response' },
      { status: 500 }
    )
  }
}
