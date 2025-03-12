import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { NFTTokenInfo } from '@/types/Token'
import { useTranslations } from 'next-intl'
import { VersionedTransaction } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'

export function useNftListing(
  token: NFTTokenInfo | null,
  walletAddress: string,
  primaryWallet: any
) {
  const t = useTranslations()
  const { toast } = useToast()
  const [listAmount, setListAmount] = useState<string>('')
  const [showNftListLoading, setShowNftListLoading] = useState<boolean>(false)
  const [auctionHouse, setAuctionHouse] = useState<string | null>(null)
  const [collectionSymbol, setCollectionSymbol] = useState<string | null>(null)

  const validateAmount = (value: string): boolean => {
    // Empty check
    if (value === '') return false

    // Convert to number and check if it's valid
    const numericValue = Number(value)

    // Check if NaN or not positive
    if (isNaN(numericValue) || numericValue <= 0) {
      return false
    }

    return true
  }

  const handleNftList = async () => {
    try {
      setShowNftListLoading(true)

      if (!token || !auctionHouse) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_list_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
        return
      }

      if (!validateAmount(listAmount)) {
        toast({
          title: 'List Amount Error',
          description: 'Invalid List Amount. Please try to input again',
          variant: 'error',
          duration: 5000,
        })
        return
      }

      // Step 1: Fetch listing transaction from backend
      const listRes = await fetch(
        `/api/magiceden/instructions/list?seller=${walletAddress}&auctionHouseAddress=${auctionHouse}&tokenMint=${token.id
        }&tokenAccount=${token.id}&price=${Number(listAmount)}`
      )
      const listResData = await listRes.json()

      // Step 2: Deserialize the transaction
      const serializedBuffer = Buffer.from(listResData.listTx, 'base64')
      const vtx: VersionedTransaction = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )

      // Step 3: Get wallet signer & RPC connection
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')

      // Step 4: Simulate the transaction (optional debugging step)
      const simulateTx = await connection.simulateTransaction(vtx, {
        replaceRecentBlockhash: true,
      })
      console.log('Simulation result:', simulateTx)

      // Step 5: Sign & send the transaction
      const signer = await primaryWallet.getSigner()
      const listTxid = await signer.signAndSendTransaction(vtx)

      // Step 6: Show "confirming transaction" toast
      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      // Step 7: Confirm the transaction
      const latestBlockhash = await connection.getLatestBlockhash()
      const tx = await connection.confirmTransaction({
        signature: listTxid.signature,
        ...latestBlockhash,
      })

      // Step 8: Dismiss the confirmation toast
      confirmToast.dismiss()

      // Step 9: Handle transaction success or failure
      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_list_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_list_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_list_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    } finally {
      setShowNftListLoading(false)
      setListAmount("")
    }
  }

  useEffect(() => {
    if (!token) return
    (async () => {
      try {
        const collectionAddy = token.grouping?.find(
          (g: { group_key: string; group_value: string }) =>
            g.group_key === 'collection'
        )?.group_value

        if (collectionAddy) {
          const getCollectionSymbolRes = await fetch(
            `/api/magiceden/collection/${collectionAddy}`
          )
          const collectionSymbolData = await getCollectionSymbolRes.json()
          setCollectionSymbol(collectionSymbolData.collectionSymbol)
        }
      } catch (error) {
        console.error('Error fetching token info:', error)
      }
    })()
  }, [token])

  useEffect(() => {
    if (!collectionSymbol) return
    (async () => {
      try {
        const auctionHouseRes = await fetch(
          `/api/magiceden/collection/${collectionSymbol}/auctionHose`
        )
        const auctionHouseResData = await auctionHouseRes.json()
        setAuctionHouse(auctionHouseResData.auctionHouse)
      } catch (error) {
        console.error('Error fetching auction house info:', error)
      }
    })()
  }, [collectionSymbol])
  return {
    handleNftList,
    listAmount,
    setListAmount,
    showNftListLoading
  }
}