# Tapestry Protocol Explorer

A social graph explorer for the Solana blockchain, built with [Tapestry Protocol](https://usetapestry.dev). Explore social connections, NFTs, and token holdings on Solana. View detailed wallet analytics, track social relationships, and discover new connections in the Tapestry Protocol ecosystem.

## Features

- 🔍 Explore social connections between wallets
- 💰 View detailed wallet analytics
- 🖼️ Browse NFT collections and holdings
- 📊 Track token balances and transactions
- 🤝 Follow other wallets and build your network
- 🌐 Real-time updates for on-chain activity

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [pnpm](https://pnpm.io/) - Package Manager
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) - Blockchain Interaction
- [Tapestry Protocol](https://docs.usetapestry.dev/) - Social Graph Protocol

## Prerequisites

- Node.js 18+
- pnpm 8+
- A Tapestry Protocol API key
- A Helius RPC URL and API key
- A Birdeye API key (optional, for token analytics)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/tapestry-protocol/explorer.git
cd explorer
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

See [.env.example](.env.example) for all required and optional environment variables.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript compiler check

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [https://docs.usetapestry.dev](https://docs.usetapestry.dev)
- Discord: [Join our community](https://discord.gg/tapestry)
- Twitter: [@TapestryProto](https://twitter.com/TapestryProto)
- Email: support@usetapestry.dev

## Tapestry endpoints

Tapestry endpoints are defined in the file `tapestry.ts`
