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
}

export class SwapService {
  private connection: Connection
  private grafanaService: GrafanaService

  constructor(connection: Connection) {
    this.connection = connection
    this.grafanaService = GrafanaService.getInstance()
  }

  private logError(context: ErrorLogContext) {
    const {
      operation,
      error,
      details = {},
      walletAddress,
      mintAddress,
    } = context
    const logContext = {
      timestamp: new Date().toISOString(),
      service: 'SwapService',
      operation,
      error,
      walletAddress,
      mintAddress,
      ...details,
    }

    console.error(JSON.stringify(logContext, null, 2))
    return this.grafanaService.logError(new Error(error), {
      severity: 'error',
      source: 'jupiter-swap',
      endpoint: '/api/jupiter/swap',
      metadata: logContext,
    })
  }

  private async verifyOrCreateATA(
    mintAddress: string,
    ownerAddress: string,
    label: string
  ): Promise<PublicKey> {
    try {
      const associatedTokenAddress = await getAssociatedTokenAddress(
        new PublicKey(mintAddress),
        new PublicKey(ownerAddress),
        false
      )

      const ataInfo = await this.connection.getAccountInfo(
        associatedTokenAddress
      )
      if (!ataInfo) {
        const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY
        if (!PRIVATE_KEY) {
          await this.logError({
            operation: 'verifyOrCreateATA',
            error: 'PAYER_PRIVATE_KEY not set',
            walletAddress: ownerAddress,
            mintAddress,
            details: {
              label,
              ataAddress: associatedTokenAddress.toString(),
            },
          })
          throw new Error('PAYER_PRIVATE_KEY is not set')
        }

        const secretKey = bs58.decode(PRIVATE_KEY)
        const payer = Keypair.fromSecretKey(secretKey)

        try {
          await createATAIfNotExists(
            this.connection,
            payer,
            new PublicKey(mintAddress),
            new PublicKey(ownerAddress),
            'High'
          )
        } catch (error: any) {
          await this.logError({
            operation: 'createATAIfNotExists',
            error: error.message,
            walletAddress: ownerAddress,
            mintAddress,
            details: {
              label,
              ataAddress: associatedTokenAddress.toString(),
              errorCode: error.code,
            },
          })
          throw error
        }
      }

      return associatedTokenAddress
    } catch (error: any) {
      await this.logError({
        operation: 'verifyOrCreateATA',
        error: error.message,
        walletAddress: ownerAddress,
        mintAddress,
        details: {
          label,
          errorCode: error.code,
        },
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
      console.log(
        JSON.stringify(
          {
            operation: 'createSwapTransaction:start',
            walletAddress: request.walletAddress,
            mintAddress: request.mintAddress,
            details: {
              slippageMode: request.slippageMode,
              slippageBps: request.slippageBps,
              hasSSEFee: !!request.sseTokenAccount,
            },
          },
          null,
          2
        )
      )

      // Verify output token ATA
      const outputAta = await this.verifyOrCreateATA(
        request.mintAddress,
        JUPITER_CONFIG.FEE_WALLET,
        'output-token'
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
        },
      })
      throw error
    }
  }
}
