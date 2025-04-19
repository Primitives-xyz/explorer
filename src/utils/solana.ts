import { Connection, PublicKey, SystemProgram, Transaction, SignatureResult } from '@solana/web3.js'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { toast } from 'sonner'

export interface PaymentResult {
  success: boolean
  signature?: string
  error?: string
  transactionStatus?: SignatureResult
}

/**
 * Pays a service fee to a specified wallet
 * 
 * @param {Object} params - The payment parameters
 * @param {string} params.feeWalletAddress - The wallet address to pay the fee to
 * @param {number} params.feeAmount - The amount to pay in SOL
 * @param {any} params.wallet - The user's wallet
 * @param {string} params.userWalletAddress - The user's wallet address
 * @param {Connection} params.connection - The Solana connection to use
 * @param {string} [params.serviceName] - Optional name of the service being paid for (for toast messages)
 * @returns {Promise<PaymentResult>} The payment result
 */
export async function payForService({
  feeWalletAddress,
  feeAmount,
  wallet,
  userWalletAddress,
  connection,
  serviceName = 'service'
}: {
  feeWalletAddress: string
  feeAmount: number
  wallet: any
  userWalletAddress: string
  connection: Connection
  serviceName?: string
}): Promise<PaymentResult> {
  if (!wallet || !isSolanaWallet(wallet)) {
    toast.error('Please connect a Solana wallet first')
    return { success: false, error: 'No Solana wallet connected' }
  }

  try {
    // Create a fee payment transaction
    const feeTransaction = new Transaction()
    feeTransaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(userWalletAddress),
        toPubkey: new PublicKey(feeWalletAddress),
        lamports: feeAmount * 1_000_000_000, // Convert to lamports (1 SOL = 10^9 lamports)
      })
    )
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    feeTransaction.recentBlockhash = blockhash
    feeTransaction.feePayer = new PublicKey(userWalletAddress)
    
    // Get signer from wallet
    const signer = await wallet.getSigner()
    
    // Sign and send the transaction
    console.log(`Sending ${feeAmount} SOL for ${serviceName} to fee wallet: ${feeWalletAddress}`)
    const feeSignature = await signer.signAndSendTransaction(feeTransaction)
    
    // The signature might be an object with signature property or a string
    const signatureStr = typeof feeSignature === 'string' 
      ? feeSignature 
      : (feeSignature as any).signature || feeSignature.toString()
    
    console.log(`${serviceName} payment transaction signature:`, signatureStr)
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signatureStr, 'confirmed')
    
    if (confirmation.value.err) {
      const errorMsg = `Payment failed: ${confirmation.value.err}`
      console.error(errorMsg)
      return { 
        success: false, 
        signature: signatureStr, 
        error: errorMsg,
        transactionStatus: confirmation.value
      }
    }
    
    console.log(`${serviceName} payment confirmed`)
    return { 
      success: true, 
      signature: signatureStr,
      transactionStatus: confirmation.value
    }
    
  } catch (error) {
    const errorMsg = `Error paying for ${serviceName}: ${error instanceof Error ? error.message : String(error)}`
    console.error(errorMsg)
    return { 
      success: false, 
      error: errorMsg
    }
  }
}

/**
 * Attempts to refund a service fee
 * 
 * @param {Object} params - The refund parameters
 * @param {string} params.userWallet - The user's wallet address to refund to
 * @param {string} params.feeWallet - The wallet address that received the original fee
 * @param {number} params.refundAmount - The amount to refund in SOL
 * @param {Connection} params.connection - The Solana connection to use
 * @param {string} [params.originalTxSignature] - The signature of the original payment transaction
 * @returns {Promise<{ transactionCreated: boolean, refundInfo?: any, error?: string }>} The refund result
 */
export async function refundServiceFee({
  userWallet,
  feeWallet,
  refundAmount,
  connection,
  originalTxSignature
}: {
  userWallet: string
  feeWallet: string
  refundAmount: number
  connection: Connection
  originalTxSignature?: string
}): Promise<{ 
  transactionCreated: boolean
  refundInfo?: any
  error?: string
}> {
  try {
    console.log('Attempting to refund service fee...')
    if (originalTxSignature) {
      console.log('Original transaction signature for refund:', originalTxSignature)
    }
    
    // Create a refund transaction
    const refundTransaction = new Transaction()
    refundTransaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(feeWallet),
        toPubkey: new PublicKey(userWallet),
        lamports: refundAmount * 1_000_000_000, // Convert to lamports
      })
    )
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    refundTransaction.recentBlockhash = blockhash
    refundTransaction.feePayer = new PublicKey(feeWallet)
    
    // For now, log this attempt - in a real implementation, 
    // the server would need to sign and execute this refund
    const refundInfo = {
      from: feeWallet,
      to: userWallet,
      amount: refundAmount,
      transaction: refundTransaction,
      originalTxSignature
    }
    
    console.log('Refund transaction created (not actually executed in demo):', refundInfo)
    
    return {
      transactionCreated: true,
      refundInfo
    }
    
  } catch (error) {
    const errorMsg = `Error creating refund transaction: ${error instanceof Error ? error.message : String(error)}`
    console.error(errorMsg)
    return {
      transactionCreated: false,
      error: errorMsg
    }
  }
} 