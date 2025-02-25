import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { transaction } = await request.json()
    let API_KEY = process.env.ANTHROPIC_API_KEY

    console.log('Input transaction:', transaction)

    if (!API_KEY) {
      throw 'Anthropic API key missing.'
    }
    const headers = new Headers()
    headers.append('Accept', 'application/json')
    headers.append('anthropic-version', '2023-06-01')
    headers.append('x-api-key', API_KEY)

    const requestBody = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are an expert Solana blockchain analyst with deep knowledge of DeFi protocols, NFTs, and on-chain mechanics. Analyze this transaction and provide a detailed explanation in the following JSON format:

{
  "summaries": {
    "brief": "One-line summary of the overall transaction",
    "detailed": "A more detailed 2-3 sentence explanation of what this transaction accomplishes"
  },
  "type": {
    "primary": "The main transaction type (e.g. Token Swap, NFT Sale, Stake Operation)",
    "secondary": ["Any additional transaction types involved"]
  },
  "details": {
    "operations": [
      {
        "step": "number",
        "action": "The type of operation (e.g. Swap, Transfer, Mint)",
        "description": "Detailed explanation of what happened in this step",
        "from": {
          "amount": "amount with token",
          "address": "source address if applicable"
        },
        "to": {
          "amount": "amount with token",
          "address": "destination address if applicable"
        },
        "priceImpact": "price impact if relevant"
      }
    ],
    "fees": {
      "transactionFee": "amount in SOL",
      "protocolFees": [
        {
          "protocol": "name of protocol",
          "amount": "fee amount",
          "token": "fee token"
        }
      ]
    }
  },
  "protocols": {
    "primary": "Main protocol used",
    "integrated": ["Other protocols or programs involved"]
  },
  "analysis": {
    "marketImpact": "Analysis of the transaction's effect on market prices or liquidity",
    "timing": "Analysis of transaction timing and market conditions",
    "efficiency": "Analysis of routing efficiency and fees paid",
    "risks": ["List of potential risks or security considerations"],
    "recommendations": ["Optional suggestions for similar future transactions"]
  }
}

Analyze the following transaction data and provide a comprehensive explanation in the format above. Focus on details that would be relevant to traders and DeFi users: ${JSON.stringify(
            transaction
          )}`,
        },
      ],
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))
    console.log('Request headers:', Object.fromEntries(headers.entries()))

    const response = await fetch(`https://api.anthropic.com/v1/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    console.log('Response status:', response.status)
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    )

    let body = await response.json()
    console.log('Response body:', JSON.stringify(body, null, 2))

    if (body?.content[0]?.text) {
      // Parse the JSON response from the text
      try {
        const jsonStart = body.content[0].text.indexOf('{')
        const jsonEnd = body.content[0].text.lastIndexOf('}') + 1
        const jsonStr = body.content[0].text.slice(jsonStart, jsonEnd)
        const parsedResponse = JSON.parse(jsonStr)
        return NextResponse.json(parsedResponse)
      } catch (e) {
        console.error('Failed to parse LLM response as JSON:', e)
        return NextResponse.json({ text: body.content[0].text })
      }
    }

    throw `Invalid response from Anthropic: ${JSON.stringify(body)}`
  } catch (error) {
    console.error('Unable to get the LLM response:', error)
    return NextResponse.json(
      { error: 'Failed to get an LLM response' },
      { status: 500 }
    )
  }
}
