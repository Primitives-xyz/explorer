import { TapestryClient } from 'socialfi'

const TAPESTRY_API_KEY = process.env.TAPESTRY_API_KEY

if (!TAPESTRY_API_KEY) {
  throw new Error('TAPESTRY_API_KEY is not set')
}

// Initialize the client with your API key
export const socialfi = new TapestryClient({
  apiKey: TAPESTRY_API_KEY,
})
