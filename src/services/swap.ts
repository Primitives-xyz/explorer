import { JUPITER_CONFIG } from '@/config/jupiter'
import { GrafanaService } from '@/services/grafana'
import {
  buildTransactionMessage,
  createSSETransferInstruction,
  fetchSwapInstructions,
  getAddressLookupTableAccounts,
  simulateTransaction,
} from '@/services/jupiter'
import type { SwapRouteResponse } from '@/types/jupiter-service'
import { createATAIfNotExists } from '@/utils/token'
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
} from '@solana/spl-token'
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js'
import bs58 from 'bs58'

export interface SwapRequest {
  quoteResponse: any
  walletAddress: string
  sseTokenAccount?: string
  sseFeeAmount?: string
  priorityFee?: number
  mintAddress: string
  isCopyTrade?: boolean
  slippageMode: 'auto' | 'fixed'
  slippageBps: number
}

interface ErrorLogContext {
  operation: string
  walletAddress?: string
  mintAddress?: string
  error: string
  details?: Record<string, any>
  signature?: string
  blockHeight?: number
  slot?: number
  transactionError?: any
  simulationLogs?: string[]
  inputAmount?: string
  outputAmount?: string
  slippage?: number
}

export class SwapService {
  private connection: Connection
  private grafanaService: GrafanaService

  constructor(connection: Connection) {
    this.connection = connection
    this.grafanaService = GrafanaService.getInstance()
  }

  private async getPayerKeypair(): Promise<Keypair> {
    const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY
    if (!PRIVATE_KEY) {
      throw new Error('PAYER_PRIVATE_KEY is not set')
    }
    const secretKey = bs58.decode(PRIVATE_KEY)
    return Keypair.fromSecretKey(secretKey)
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public async verifyOrCreateATA(
    mintAddress: string,
    ownerAddress: string,
    retryCount = 0
  ): Promise<PublicKey> {
    try {
      // Get the payer ready in case we need it
      const payer = await this.getPayerKeypair()

      // Call createATAIfNotExists directly - it will handle the existence check
      const { wasCreated, ata: associatedTokenAddress } =
        await createATAIfNotExists(
          this.connection,
          payer,
          new PublicKey(mintAddress),
          new PublicKey(ownerAddress),
          'High'
        )

      return associatedTokenAddress
    } catch (error: any) {
      const maxRetries = 3
      if (retryCount < maxRetries) {
        const delayMs = 500 * Math.pow(2, retryCount) // Exponential backoff: 500ms, 1000ms, 2000ms
        console.log(
          `Retrying verifyOrCreateATA attempt ${
            retryCount + 1
          }/${maxRetries} after ${delayMs}ms delay`
        )
        await this.delay(delayMs)
        return this.verifyOrCreateATA(mintAddress, ownerAddress, retryCount + 1)
      }

      const errorDetails = {
        errorCode: error.code,
        ataAddress: (
          await getAssociatedTokenAddress(
            new PublicKey(mintAddress),
            new PublicKey(ownerAddress),
            false
          )
        ).toString(),
        mintExists: !!(await this.connection.getAccountInfo(
          new PublicKey(mintAddress)
        )),
        feeWallet: JUPITER_CONFIG.FEE_WALLET,
        isForFeeWallet: ownerAddress === JUPITER_CONFIG.FEE_WALLET,
        retryAttempts: retryCount,
      }

      await this.logError({
        operation: 'verifyOrCreateATA',
        error: error.message,
        walletAddress: ownerAddress,
        mintAddress,
        details: errorDetails,
      })
      throw error
    }
  }

  // create connection
  public static async createConnection(): Promise<Connection> {
    return new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    )
  }

  private async _handlePlatformFeeAta(
    request: SwapRequest,
    payerKeypair: Keypair,
    preInstructions: TransactionInstruction[]
  ): Promise<PublicKey> {
    const platformFeeOutputAta = await getAssociatedTokenAddress(
      new PublicKey(request.mintAddress),
      new PublicKey(JUPITER_CONFIG.FEE_WALLET),
      false,
      TOKEN_PROGRAM_ID
    )
    try {
      await getAccount(
        this.connection,
        platformFeeOutputAta,
        'confirmed',
        TOKEN_PROGRAM_ID
      )
      console.log('_handlePlatformFeeAta: getAccount success')
    } catch (error: any) {
      console.log('_handlePlatformFeeAta: getAccount error:', error)
      if (
        error instanceof TokenAccountNotFoundError ||
        error.message?.includes('Account not found')
      ) {
        preInstructions.push(
          createAssociatedTokenAccountInstruction(
            payerKeypair.publicKey, // Payer
            platformFeeOutputAta,
            new PublicKey(JUPITER_CONFIG.FEE_WALLET), // Owner
            new PublicKey(request.mintAddress) // Mint
          )
        )
        console.log(
          '_handlePlatformFeeAta: Adding instruction to create platformFeeOutputAta:',
          platformFeeOutputAta.toString()
        )
      } else {
        console.log('_handlePlatformFeeAta: getAccount error:', error)
        await this.logError({
          operation: '_handlePlatformFeeAta.getAccount',
          error: error.message,
          walletAddress: request.walletAddress,
          mintAddress: request.mintAddress,
          details: {
            ataAddress: platformFeeOutputAta.toString(),
            owner: JUPITER_CONFIG.FEE_WALLET,
          },
        })
        throw error
      }
    }
    return platformFeeOutputAta
  }

  private async _handleUserSseTokenAta(
    request: SwapRequest,
    preInstructions: TransactionInstruction[]
  ): Promise<PublicKey | undefined> {
    // Only proceed if SSE token is needed
    if (
      !request.sseTokenAccount ||
      !request.sseFeeAmount ||
      request.sseFeeAmount === '0'
    ) {
      return undefined
    }

    const userSseTokenSourceAta = await getAssociatedTokenAddress(
      new PublicKey(JUPITER_CONFIG.SSE_TOKEN_MINT),
      new PublicKey(request.walletAddress),
      false,
      TOKEN_PROGRAM_ID
    )

    try {
      console.log(
        '_handleUserSseTokenAta: getAccount userSseTokenSourceAta:',
        userSseTokenSourceAta.toString()
      )
      await getAccount(
        this.connection,
        userSseTokenSourceAta,
        'confirmed',
        TOKEN_PROGRAM_ID
      )
      console.log('_handleUserSseTokenAta: getAccount success')
    } catch (error: any) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error.message?.includes('Account not found')
      ) {
        preInstructions.push(
          createAssociatedTokenAccountInstruction(
            new PublicKey(request.walletAddress), // Payer (user)
            userSseTokenSourceAta,
            new PublicKey(request.walletAddress), // Owner (user)
            new PublicKey(JUPITER_CONFIG.SSE_TOKEN_MINT) // Mint
          )
        )
        console.log(
          '_handleUserSseTokenAta: Adding instruction to create userSseTokenSourceAta:',
          userSseTokenSourceAta.toString()
        )
      } else {
        await this.logError({
          operation: '_handleUserSseTokenAta.getAccount',
          error: error.message,
          walletAddress: request.walletAddress,
          mintAddress: JUPITER_CONFIG.SSE_TOKEN_MINT,
          details: {
            ataAddress: userSseTokenSourceAta.toString(),
            owner: request.walletAddress,
          },
        })
        throw error
      }
    }

    return userSseTokenSourceAta
  }

  private async _fetchJupiterSwapInstructions(
    request: SwapRequest,
    platformFeeOutputAta: PublicKey
  ): Promise<any> {
    const effectiveSlippageBps =
      request.slippageMode === 'auto'
        ? request.quoteResponse.slippageBps
        : request.slippageBps

    try {
      return await fetchSwapInstructions({
        quoteResponse: request.quoteResponse,
        userPublicKey: request.walletAddress,
        prioritizationFeeLamports: request.priorityFee,
        feeAccount: platformFeeOutputAta.toString(),
        slippageBps: effectiveSlippageBps,
        // destinationTokenAccount is omitted to let Jupiter handle user's output ATA creation
      })
    } catch (error: any) {
      await this.logError({
        operation: '_fetchJupiterSwapInstructions',
        error: error.message,
        walletAddress: request.walletAddress,
        mintAddress: request.mintAddress,
        details: {
          platformFeeOutputAta: platformFeeOutputAta.toString(),
          slippageBps: effectiveSlippageBps,
          priorityFee: request.priorityFee,
        },
      })
      throw error
    }
  }

  private async _getAddressLookupTableAccounts(
    request: SwapRequest,
    addressLookupTableAddresses: string[]
  ): Promise<any[]> {
    try {
      return await getAddressLookupTableAccounts(
        this.connection,
        addressLookupTableAddresses || []
      )
    } catch (error: any) {
      await this.logError({
        operation: '_getAddressLookupTableAccounts',
        error: error.message,
        walletAddress: request.walletAddress,
        mintAddress: request.mintAddress,
        details: {
          lookupTableAddresses: addressLookupTableAddresses,
        },
      })
      throw error
    }
  }

  private async _createSseTransferInstruction(
    request: SwapRequest,
    userSseTokenSourceAta: PublicKey
  ): Promise<TransactionInstruction | undefined> {
    if (
      !request.sseTokenAccount ||
      !request.sseFeeAmount ||
      request.sseFeeAmount === '0' ||
      !userSseTokenSourceAta
    ) {
      return undefined
    }

    try {
      return await createSSETransferInstruction(
        this.connection,
        userSseTokenSourceAta,
        new PublicKey(request.sseTokenAccount),
        new PublicKey(request.walletAddress),
        request.sseFeeAmount
      )
    } catch (error: any) {
      await this.logError({
        operation: '_createSseTransferInstruction',
        error: error.message,
        walletAddress: request.walletAddress,
        mintAddress: JUPITER_CONFIG.SSE_TOKEN_MINT,
        details: {
          userSseTokenSourceAta: userSseTokenSourceAta.toString(),
          sseTokenAccountDestination: request.sseTokenAccount,
          sseFeeAmount: request.sseFeeAmount,
        },
      })
      throw error
    }
  }

  public async buildSwapTransaction(request: SwapRequest): Promise<{
    transaction: VersionedTransaction
    swapResponse: any
    addressLookupTableAccounts: any[]
  }> {
    const preInstructions: TransactionInstruction[] = []
    const payerKeypair = await this.getPayerKeypair()

    try {
      // Handle platform fee ATA creation
      const platformFeeOutputAta = await this._handlePlatformFeeAta(
        request,
        payerKeypair,
        preInstructions
      )

      // Handle user's SSE token ATA if needed
      const userSseTokenSourceAta = await this._handleUserSseTokenAta(
        request,
        preInstructions
      )

      // Get Jupiter swap instructions
      const swapResponse = await this._fetchJupiterSwapInstructions(
        request,
        platformFeeOutputAta
      )

      // Get address lookup table accounts
      const addressLookupTableAccounts =
        await this._getAddressLookupTableAccounts(
          request,
          swapResponse.addressLookupTableAddresses || []
        )

      // Get blockhash for transaction
      const { blockhash } = await this.connection.getLatestBlockhash()

      // Create SSE transfer instruction if needed
      const sseTransferInstruction = await this._createSseTransferInstruction(
        request,
        userSseTokenSourceAta as PublicKey
      )

      // Combine preInstructions with Jupiter's setupInstructions
      const combinedSetupInstructions = [
        ...preInstructions,
        ...(swapResponse.setupInstructions || []),
      ]

      // Log instruction counts
      console.log(
        'buildSwapTransaction: preInstructions count (includes any ATAs):',
        preInstructions.length
      )
      console.log(
        'buildSwapTransaction: Jupiter setupInstructions count:',
        (swapResponse.setupInstructions || []).length
      )
      console.log(
        'buildSwapTransaction: combinedSetupInstructions count:',
        combinedSetupInstructions.length
      )
      if (sseTransferInstruction) {
        console.log('buildSwapTransaction: Adding sseTransferInstruction')
      } else {
        console.log('buildSwapTransaction: No sseTransferInstruction to add')
      }

      // Build transaction message
      const message = buildTransactionMessage(
        new PublicKey(request.walletAddress),
        blockhash,
        {
          ...swapResponse,
          setupInstructions: combinedSetupInstructions,
        },
        sseTransferInstruction,
        addressLookupTableAccounts
      )
      console.log('TRANSACTION MESSAGE BUILT')
      return {
        transaction: new VersionedTransaction(message),
        swapResponse,
        addressLookupTableAccounts,
      }
    } catch (error: any) {
      await this.logError({
        operation: 'buildSwapTransaction',
        error: error.message,
        walletAddress: request.walletAddress,
        mintAddress: request.mintAddress,
        details: {
          errorCode: error.code,
          priorityFee: request.priorityFee,
        },
      })
      throw error
    }
  }

  public async createSwapTransaction(
    request: SwapRequest
  ): Promise<SwapRouteResponse> {
    try {
      // Verify output token ATA - REMOVED for JUPITER_CONFIG.FEE_WALLET
      // const outputAta = await this.verifyOrCreateATA(
      //   request.mintAddress,
      //   JUPITER_CONFIG.FEE_WALLET,
      //   3
      // )

      // Verify SSE token ATA if needed - REMOVED for user's SSE source ATA
      if (
        request.sseTokenAccount &&
        request.sseFeeAmount &&
        request.sseFeeAmount !== '0'
      ) {
        // await this.verifyOrCreateATA( // This was for user's source SSE ATA
        //   JUPITER_CONFIG.SSE_TOKEN_MINT,
        //   request.walletAddress
        // )
      }

      // Build and simulate transaction
      const { transaction, swapResponse, addressLookupTableAccounts } =
        await this.buildSwapTransaction(request) // outputAta argument removed
      console.log('TRANSACTION BUILT')
      try {
        await simulateTransaction(
          this.connection,
          transaction,
          addressLookupTableAccounts
        )
      } catch (error: any) {
        await this.logError({
          operation: 'simulateTransaction',
          error: error.message,
          walletAddress: request.walletAddress,
          mintAddress: request.mintAddress,
          details: {
            simulationLogs: error.logs,
            errorCode: error.code,
          },
          simulationLogs: error.logs,
          inputAmount: request.quoteResponse.inAmount,
          outputAmount: request.quoteResponse.outAmount,
          slippage: request.slippageBps,
        })
      }

      const response = {
        transaction: Buffer.from(transaction.serialize()).toString('base64'),
        lastValidBlockHeight: swapResponse.lastValidBlockHeight,
        computeUnitLimit: swapResponse.computeUnitLimit,
        prioritizationFeeLamports: swapResponse.prioritizationFeeLamports,
      }

      console.log(
        JSON.stringify(
          {
            operation: 'createSwapTransaction:success',
            walletAddress: request.walletAddress,
            mintAddress: request.mintAddress,
            details: {
              lastValidBlockHeight: response.lastValidBlockHeight,
              computeUnitLimit: response.computeUnitLimit,
              blockHeight: swapResponse.lastValidBlockHeight,
            },
          },
          null,
          2
        )
      )

      return response
    } catch (error: any) {
      await this.logError({
        operation: 'createSwapTransaction',
        error: error.message,
        walletAddress: request.walletAddress,
        mintAddress: request.mintAddress,
        details: {
          errorCode: error.code,
          priorityFee: request.priorityFee,
        },
        inputAmount: request.quoteResponse?.inAmount,
        outputAmount: request.quoteResponse?.outAmount,
        slippage: request.slippageBps,
        transactionError: error,
      })
      throw error
    }
  }

  private async logError(context: ErrorLogContext) {
    const {
      operation,
      error,
      details = {},
      walletAddress,
      mintAddress,
      signature,
      blockHeight,
      slot,
      transactionError,
      simulationLogs,
      inputAmount,
      outputAmount,
      slippage,
    } = context

    // Clean error message for logging
    const cleanError = error.replace(/\n/g, ' ').replace(/"/g, "'")

    const logContext = {
      timestamp: new Date().toISOString(),
      service: 'SwapService',
      operation,
      error: cleanError,
      walletAddress,
      mintAddress,
      signature,
      blockHeight,
      slot,
      transactionError,
      simulationLogs,
      inputAmount,
      outputAmount,
      slippage,
      ...details,
    }

    // Console log with pretty printing for local debugging
    console.error(JSON.stringify(logContext, null, 2))

    // Simplified context for Grafana to prevent parsing errors
    const grafanaContext = {
      error: cleanError,
      operation,
      wallet: walletAddress?.slice(0, 8) || 'unknown',
      mint: mintAddress?.slice(0, 8) || 'unknown',
      errorType: details.errorCode || 'unknown',
      signature: signature?.slice(0, 8) || 'unknown',
      blockHeight: blockHeight || 0,
      slot: slot || 0,
    }

    return this.grafanaService.logError(new Error(cleanError), {
      severity: 'error',
      source: 'jupiter-swap',
      endpoint: '/api/jupiter/swap',
      metadata: grafanaContext,
    })
  }
}
