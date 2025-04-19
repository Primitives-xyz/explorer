import { useState } from 'react'
import { toast } from 'sonner'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { z } from 'zod'
import { Connection, PublicKey } from '@solana/web3.js'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { payForService, refundServiceFee } from '@/utils/solana'

// Fee amount in SOL
const LAUNCH_FEE_SOL = 0.01

export const launchTokenSchema = z.object({
  tokenName: z.string().min(1, 'Token name is required'),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  initialTokenReserves: z.number().positive('Initial supply must be positive'),
  shift: z.number().positive('Virtual SOL amount must be positive'),
  decimals: z.coerce.number().min(0).max(9).optional().default(9),
  royaltiesBps: z.coerce.number().min(0).max(10000).optional().default(100),
  tokenImage: z.string().optional(),
  useTapAddress: z.boolean().optional().default(false),
})

export type LaunchTokenData = z.infer<typeof launchTokenSchema>

export interface LaunchData {
  mintB?: string
  poolAddress?: string
  transaction?: string
  feePaymentTx?: string
}

export function useLaunch() {
  const [isLoading, setIsLoading] = useState(false)
  const [payingFee, setPayingFee] = useState(false)
  const [mintingToken, setMintingToken] = useState(false)
  const [launchingPool, setLaunchingPool] = useState(false)
  const [findingTapAddress, setFindingTapAddress] = useState(false)
  const [tapAddressAttempts, setTapAddressAttempts] = useState(0)
  const [launchSuccess, setLaunchSuccess] = useState(false)
  const [launchData, setLaunchData] = useState<LaunchData>({})
  const { walletAddress, primaryWallet, isLoggedIn, setShowAuthFlow } = useCurrentWallet()

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const resetLaunch = () => {
    setLaunchSuccess(false)
    setLaunchData({})
  }

  const launchToken = async (values: LaunchTokenData) => {
    setIsLoading(true)
    setPayingFee(false)
    setMintingToken(false)
    setLaunchingPool(false)
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
      // Setup connection
      const connection = new Connection('https://api.devnet.solana.com')
      const feeWalletAddress = process.env.FEE_WALLET || '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz' // Fallback if env var not set
      
      // Step 1: Pay launching fee - 0.01 SOL to FEE_WALLET
      setPayingFee(true)
      
      const paymentResult = await payForService({
        feeWalletAddress,
        feeAmount: LAUNCH_FEE_SOL,
        wallet: primaryWallet,
        userWalletAddress: walletAddress,
        connection,
        serviceName: 'token launch'
      })
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to pay launch fee')
      }
      
      // Store the fee payment signature
      const feeSignature = paymentResult.signature as string
      setLaunchData(prevData => ({ ...prevData, feePaymentTx: feeSignature }))
      setPayingFee(false)
      
      // If tap address is selected, first find a tap address
      let tapAddressData: any = null
      if (values.useTapAddress) {
        setFindingTapAddress(true)
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
          setFindingTapAddress(false)
          return
        }
        setFindingTapAddress(false)
      }
      
      // Step 2: Mint the token
      setMintingToken(true)
      
      // Add the payment transaction signature to the URL params
      console.log('Minting token with payment signature:', feeSignature)
      
      // Prepare the mint parameters with TAP address if available
      const mintParamsObj = {
        tokenName: values.tokenName,
        tokenSymbol: values.tokenSymbol,
        initialSupply: values.initialTokenReserves,
        decimals: values.decimals,
        tokenImage: values.tokenImage || undefined
      };
      
      // If we have a TAP address, include it in the mint params object
      if (tapAddressData && values.useTapAddress) {
        console.log('Including TAP address in mint params, publicKey:', tapAddressData.publicKey);
        
        // Log the first few characters of the secret key for debugging (never log entire private keys in production)
        if (tapAddressData.secretKey) {
          const secretStart = tapAddressData.secretKey.substring(0, 10);
          console.log(`Secret key format: ${typeof tapAddressData.secretKey}, length: ${tapAddressData.secretKey.length}, starts with: ${secretStart}...`);
        }
        
        // Pass the mintKeypair exactly as received from the API
        (mintParamsObj as any).mintKeypair = {
          publicKey: tapAddressData.publicKey,
          secretKey: tapAddressData.secretKey
        };
      }

      // The server expects a payment transaction, but it's treating it as a signature
      // Let's send just the signature as the paymentTx parameter
      const mintResponse = await fetch(`/api/actions/vertigo/mint-token/process?paymentTx=${feeSignature}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: walletAddress,
          mintParams: mintParamsObj
        }),
      })
      
      if (!mintResponse.ok) {
        const errorData = await mintResponse.json()
        console.error(errorData)
        await refundServiceFee({
          userWallet: walletAddress,
          feeWallet: feeWalletAddress,
          refundAmount: LAUNCH_FEE_SOL,
          connection,
          originalTxSignature: feeSignature
        })
        throw new Error(errorData.error || 'Failed to mint token')
      }
      
      const mintData = await mintResponse.json()
      console.log('Token minted successfully:', mintData)
      toast.success('Token minted successfully!')
      
      // Step 3: Launch the pool with the minted token
      setMintingToken(false)
      setLaunchingPool(true)
      
      // Create URL with search params for pool launch
      const poolParams = new URLSearchParams()
      poolParams.append('mintB', mintData.mintAddress)
      poolParams.append('tokenWallet', mintData.tokenWallet)
      poolParams.append('tokenName', values.tokenName)
      poolParams.append('tokenSymbol', values.tokenSymbol)
      poolParams.append('initialTokenBReserves', values.initialTokenReserves.toString())
      poolParams.append('shift', values.shift.toString())
      poolParams.append('royaltiesBps', values.royaltiesBps.toString())
      
      // If token image was provided, add it to the pool params
      if (values.tokenImage) {
        poolParams.append('tokenImage', values.tokenImage)
      }
      
      // Include the wallet authority from the minting process
      if (mintData.tokenWalletAuthority) {
        poolParams.append('walletAuthority', mintData.tokenWalletAuthority)
      }
      
      console.log('Launching pool with minted token... and params: ', poolParams.toString())
      const poolResponse = await fetch(`/api/actions/vertigo/launch-pool-with-token?${poolParams.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: walletAddress,
        }),
      })
      
      if (!poolResponse.ok) {
        const errorData = await poolResponse.json()
        console.error(errorData)
        throw new Error(errorData.error || 'Failed to launch pool')
      }
      
      const poolData = await poolResponse.json()
      toast.success('Pool launched successfully!')
      console.log('Pool launched:', poolData)
      
      // Set the combined launch data
      setLaunchData({
        mintB: mintData.mintAddress,
        poolAddress: poolData.poolAddress,
        transaction: poolData.transaction,
        feePaymentTx: feeSignature
      })
      setLaunchSuccess(true)
      
    } catch (error) {
      console.error('Error in token launch process:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to complete launch process')
    } finally {
      setIsLoading(false)
      setPayingFee(false)
      setMintingToken(false)
      setLaunchingPool(false)
    }
  }

  return {
    launchToken,
    isLoading,
    payingFee,
    mintingToken,
    launchingPool,
    findingTapAddress,
    tapAddressAttempts,
    launchSuccess,
    launchData,
    copyToClipboard,
    resetLaunch,
    isLoggedIn,
    setShowAuthFlow
  }
} 