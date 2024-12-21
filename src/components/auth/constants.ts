
// solana
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL_ ?? 'https://api.mainnet-beta.solana.com'

// protocol
export const PROTOCOL_SERVER_URL =
  process.env.PROTOCOL_SERVER_URL || 'https://protocol-server.fly.dev'

export const PROTOCOL_API_KEY = process.env.PROTOCOL_API_KEY



export const metadata = {
  name: 'tapestry-boilerplate',
  title: 'Tapestry protocol Boilerplate',
  description: 'Create your first Tapestry protocol app',
  url: 'https://tapestry-boilerplate.xyz/',
  iconUrls: ['https://tapestry-boilerplate/favicon.ico'],
  additionalInfo: '',
  walletConnectProjectId: '',
}
