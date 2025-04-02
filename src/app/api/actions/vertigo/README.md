# Vertigo Token Launcher API

This API provides endpoints to interact with the Vertigo AMM SDK for launching tokens, buying/selling tokens, and claiming royalties.

## Endpoints

### 1. Launch a Token Pool

**Endpoint:** `/api/actions/vertigo/launch-pool`

**Parameters:**

- `tokenName` (required): The name of the token
- `tokenSymbol` (required): The symbol of the token
- `initialTokenReserves` (optional): Initial token supply (default: 1,000,000,000)
- `shift` (optional): Virtual SOL amount (default: 100)
- `decimals` (optional): Token decimals (default: 9)
- `royaltiesBps` (optional): Royalty fees in basis points (default: 100 = 1%)

**Example:**

```
https://your-domain.com/api/actions/vertigo/launch-pool?tokenName=MyToken&tokenSymbol=MTK
```

### 2. Buy Tokens from a Pool

**Endpoint:** `/api/actions/vertigo/buy-tokens`

**Parameters:**

- `poolOwner` (required): Public key of the pool owner
- `mintB` (required): Public key of the token mint
- `amount` (required): Amount of SOL to spend
- `slippageBps` (optional): Slippage tolerance in basis points (default: 50 = 0.5%)

**Example:**

```
https://your-domain.com/api/actions/vertigo/buy-tokens?poolOwner=POOL_OWNER_ADDRESS&mintB=TOKEN_MINT_ADDRESS&amount=1
```

### 3. Sell Tokens to a Pool

**Endpoint:** `/api/actions/vertigo/sell-tokens`

**Parameters:**

- `poolOwner` (required): Public key of the pool owner
- `mintB` (required): Public key of the token mint
- `amount` (required): Amount of tokens to sell
- `slippageBps` (optional): Slippage tolerance in basis points (default: 50 = 0.5%)

**Example:**

```
https://your-domain.com/api/actions/vertigo/sell-tokens?poolOwner=POOL_OWNER_ADDRESS&mintB=TOKEN_MINT_ADDRESS&amount=100000
```

### 4. Claim Royalties from a Pool

**Endpoint:** `/api/actions/vertigo/claim-royalties`

**Parameters:**

- `poolAddress` (required): Public key of the pool

**Example:**

```
https://your-domain.com/api/actions/vertigo/claim-royalties?poolAddress=POOL_ADDRESS
```

## Setup Requirements

1. Set the following environment variables:

   - `PAYER_PRIVATE_KEY`: Private key for the payer account
   - `FEE_WALLET`: Public key for the fee wallet
   - `RPC_URL`: Solana RPC URL

2. Ensure you have the following dependencies installed:
   - `@vertigo-amm/vertigo-sdk`
   - `@solana/web3.js`
   - `@solana/spl-token`
   - `@coral-xyz/anchor`

## Note on Associated Token Accounts

The current implementation uses placeholder values for token accounts. In a production environment, you should:

1. Verify if the user's token accounts exist
2. Create token accounts if needed
3. Pass the actual token account addresses to the API calls

## Fee Structure

Royalty fees are collected from trading activity and can be claimed by the pool owner. The default fee is 1% (100 basis points), and half of this goes to the pool owner.
