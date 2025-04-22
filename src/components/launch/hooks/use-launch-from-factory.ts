import { useState } from 'react'
import { toast } from 'sonner'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { z } from 'zod'
import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { payForService, refundServiceFee } from '@/utils/solana'
import * as anchor from '@coral-xyz/anchor'
import { VertigoSDK } from '@vertigo-amm/vertigo-sdk'
import { NATIVE_MINT, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

// Fee amount in SOL
const LAUNCH_FEE_SOL = 0.01

export const launchTokenFromFactorySchema = z.object({
  tokenName: z.string().min(1, 'Token name is required'),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  initialTokenReserves: z.number().positive('Initial supply must be positive'),
  initialDevBuy: z.coerce.number().min(0, 'Initial purchase amount must be 0 or positive'),
  decimals: z.coerce.number().min(0).max(9).optional().default(9),
  royaltiesBps: z.coerce.number().min(0).max(10000).optional().default(100),
  tokenImage: z.string().optional(),
  useTapAddress: z.boolean().optional().default(false),
  useToken2022: z.boolean().optional().default(true),
})

export type LaunchTokenFromFactoryData = z.infer<typeof launchTokenFromFactorySchema>

export interface LaunchData {
  mintB?: string
  poolAddress?: string
  transaction?: string
  feePaymentTx?: string
}

// Define possible steps in the launch process
export type LaunchStep = 
  | 'paying_fee'
  | 'finding_tap_address'
  | 'launching_token_from_factory'
  | 'transaction_successful'
  | null

export function useLaunchFromFactory() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<LaunchStep>(null)
  const [tapAddressAttempts, setTapAddressAttempts] = useState(0)
  const [launchSuccess, setLaunchSuccess] = useState(false)
  const [launchData, setLaunchData] = useState<LaunchData>({})
  const [formValues, setFormValues] = useState<LaunchTokenFromFactoryData | null>(null)
  const { walletAddress, primaryWallet, isLoggedIn, setShowAuthFlow } = useCurrentWallet()

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const resetLaunch = () => {
    setLaunchSuccess(false)
    setLaunchData({})
    setCurrentStep(null)
    setFormValues(null)
  }

  const launchTokenFromFactory = async (values: LaunchTokenFromFactoryData) => {
    // Store the form values for the entire launch process
    setFormValues(values)
    
    // Reset states
    setIsLoading(true)
    setCurrentStep(null)
    setLaunchSuccess(false)
    setLaunchData({})
    
    // Check if wallet is connected
    if (!isLoggedIn || !walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      toast.error('Please connect your wallet first')
      setShowAuthFlow?.(true)
      setIsLoading(false)
      return
    }
    
    try {
      // Setup connection - using devnet for development
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
      const feeWalletAddress = process.env.FEE_WALLET || '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz' // Fallback if env var not set
      
      // Step 1: Pay launching fee - 0.01 SOL to FEE_WALLET
      setCurrentStep('paying_fee')
      
      const paymentResult = await payForService({
        feeWalletAddress,
        feeAmount: LAUNCH_FEE_SOL,
        wallet: primaryWallet,
        userWalletAddress: walletAddress,
        connection,
        serviceName: 'token launch from factory'
      })
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to pay launch fee')
      }
      
      // Store the fee payment signature
      const feeSignature = paymentResult.signature as string
      setLaunchData(prevData => ({ ...prevData, feePaymentTx: feeSignature }))
      
      // If tap address is selected, first find a tap address
      let mintB: Keypair
      let tapAddressData: any = null
      
      if (values.useTapAddress) {
        setCurrentStep('finding_tap_address')
        try {
          console.log('Finding TAP address...')
          const tapResponse = await fetch('/api/actions/vertigo/find-tap-address', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              account: walletAddress,
            }),
          })
          
          if (!tapResponse.ok) {
            const errorData = await tapResponse.json()
            throw new Error(errorData.error || 'Failed to find TAP address')
          }
          
          tapAddressData = await tapResponse.json()
          setTapAddressAttempts(tapAddressData.attempts)
          console.log(`Found TAP address after ${tapAddressData.attempts} attempts: ${tapAddressData.publicKey}`)
          
          // Create a keypair from the tap address
          mintB = Keypair.fromSecretKey(Buffer.from(tapAddressData.secretKey))
        } catch (error) {
          console.error('Error finding TAP address:', error)
          
          // Attempt to refund the fee
          await refundServiceFee({
            userWallet: walletAddress,
            feeWallet: feeWalletAddress,
            refundAmount: LAUNCH_FEE_SOL,
            connection,
            originalTxSignature: feeSignature
          })
          toast.error(error instanceof Error ? error.message : 'Failed to find TAP address')
          setIsLoading(false)
          setCurrentStep(null)
          return
        }
      } else {
        // Generate a random mint address if not using TAP
        mintB = Keypair.generate()
      }
      
      // Step 2: Launch token from factory
      setCurrentStep('launching_token_from_factory')
      
      try {
        // Send request to server to launch the token from our factory
        const launchResponse = await fetch(`/api/actions/vertigo/launch-token-from-factory?paymentTx=${feeSignature}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: walletAddress, // User's wallet address (will be the owner)
            mintB: {
              publicKey: mintB.publicKey.toString(),
              secretKey: Array.from(mintB.secretKey)
            },
            mintBAuthority: null, // Let the server generate this
            tokenConfig: {
              name: values.tokenName,
              symbol: values.tokenSymbol,
              uri: values.tokenImage ? values.tokenImage : '',
            },
            initialTokenReserves: values.initialTokenReserves,
            decimals: values.decimals,
            royaltiesBps: values.royaltiesBps,
            initialDevBuy: values.initialDevBuy,
            useToken2022: values.useToken2022,
          }),
        })
        
        if (!launchResponse.ok) {
          const errorData = await launchResponse.json()
          console.error(errorData)
          
          // Attempt to refund the fee
          await refundServiceFee({
            userWallet: walletAddress,
            feeWallet: feeWalletAddress,
            refundAmount: LAUNCH_FEE_SOL,
            connection,
            originalTxSignature: feeSignature
          })
          
          throw new Error(errorData.error || 'Failed to launch token from factory')
        }
        
        const launchResult = await launchResponse.json()
        console.log('Token launched from factory:', launchResult)
        
        // Set the launch data
        setLaunchData({
          mintB: mintB.publicKey.toString(),
          poolAddress: launchResult.poolAddress,
          transaction: launchResult.signature,
          feePaymentTx: feeSignature
        })
        
        // Set success state
        setCurrentStep('transaction_successful')
        toast.success('Token launched successfully from factory!')
        setLaunchSuccess(true)
        
      } catch (error) {
        console.error('Error launching token from factory:', error)
        throw error
      }
      
    } catch (error) {
      console.error('Error in token launch process:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to complete launch process')
      setCurrentStep(null)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    launchTokenFromFactory,
    isLoading,
    currentStep,
    tapAddressAttempts,
    launchSuccess,
    launchData,
    copyToClipboard,
    resetLaunch,
    isLoggedIn,
    setShowAuthFlow,
    formValues
  }
}