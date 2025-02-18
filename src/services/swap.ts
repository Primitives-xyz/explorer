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
import { getAssociatedTokenAddress } from '@solana/spl-token'
import {
  Connection,
  Keypair,
  PublicKey,
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

  private async verifyOrCreateATA(
    mintAddress: string,
    ownerAddress: string,
    label: string,
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

      console.log(
        JSON.stringify(
          {
            operation: wasCreated
              ? 'verifyOrCreateATA:created'
              : 'verifyOrCreateATA:exists',
            mintAddress,
            ownerAddress,
            label,
            ataAddress: associatedTokenAddress.toString(),
            wasCreated,
          },
          null,
          2
        )
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
        return this.verifyOrCreateATA(
          mintAddress,
          ownerAddress,
          label,
          retryCount + 1
        )
      }

      const errorDetails = {
        label,
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

  private async buildSwapTransaction(
    request: SwapRequest,
    outputAta: PublicKey
  ): Promise<{
    transaction: VersionedTransaction
    swapResponse: any
    addressLookupTableAccounts: any[]
  }> {
    try {
      const effectiveSlippageBps =
        request.slippageMode === 'auto'
          ? request.quoteResponse.slippageBps
          : request.slippageBps

      let swapResponse
      try {
        swapResponse = await fetchSwapInstructions({
          quoteResponse: request.quoteResponse,
          userPublicKey: request.walletAddress,
          prioritizationFeeLamports: request.priorityFee,
          feeAccount: outputAta.toString(),
          slippageBps: effectiveSlippageBps,
        })
      } catch (error: any) {
        await this.logError({
          operation: 'fetchSwapInstructions',
          error: error.message,
          walletAddress: request.walletAddress,
          mintAddress: request.mintAddress,
          details: {
            outputAta: outputAta.toString(),
            slippageBps: effectiveSlippageBps,
            priorityFee: request.priorityFee,
          },
        })
        throw error
      }

      let addressLookupTableAccounts
      try {
        addressLookupTableAccounts = await getAddressLookupTableAccounts(
          this.connection,
          swapResponse.addressLookupTableAddresses || []
        )
      } catch (error: any) {
        await this.logError({
          operation: 'getAddressLookupTableAccounts',
          error: error.message,
          walletAddress: request.walletAddress,
          mintAddress: request.mintAddress,
          details: {
            lookupTableAddresses: swapResponse.addressLookupTableAddresses,
          },
        })
        throw error
      }

      const { blockhash } = await this.connection.getLatestBlockhash()

      let sseTransferInstruction = undefined
      if (request.sseTokenAccount && request.sseFeeAmount) {
        try {
          const sourceTokenAccount = await getAssociatedTokenAddress(
            new PublicKey(JUPITER_CONFIG.SSE_TOKEN_MINT),
            new PublicKey(request.walletAddress)
          )

          sseTransferInstruction = await createSSETransferInstruction(
            this.connection,
            sourceTokenAccount,
            new PublicKey(request.sseTokenAccount),
            new PublicKey(request.walletAddress),
            request.sseFeeAmount
          )
        } catch (error: any) {
          await this.logError({
            operation: 'createSSETransferInstruction',
            error: error.message,
            walletAddress: request.walletAddress,
            mintAddress: JUPITER_CONFIG.SSE_TOKEN_MINT,
            details: {
              sseTokenAccount: request.sseTokenAccount,
              sseFeeAmount: request.sseFeeAmount,
            },
          })
          throw error
        }
      }

      const message = buildTransactionMessage(
        new PublicKey(request.walletAddress),
        blockhash,
        swapResponse,
        sseTransferInstruction,
        addressLookupTableAccounts
      )

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
          outputAta: outputAta.toString(),
          hasSSEFee: !!request.sseTokenAccount,
        },
      })
      throw error
    }
  }

  public async createSwapTransaction(
    request: SwapRequest
  ): Promise<SwapRouteResponse> {
    try {
      // Verify output token ATA
      const outputAta = await this.verifyOrCreateATA(
        request.mintAddress,
        JUPITER_CONFIG.FEE_WALLET,
        'output-token',
        3
      )

      // Verify SSE token ATA if needed
      if (request.sseTokenAccount) {
        await this.verifyOrCreateATA(
          JUPITER_CONFIG.SSE_TOKEN_MINT,
          request.walletAddress,
          'sse-token'
        )
      }

      // Build and simulate transaction
      const { transaction, swapResponse, addressLookupTableAccounts } =
        await this.buildSwapTransaction(request, outputAta)

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
