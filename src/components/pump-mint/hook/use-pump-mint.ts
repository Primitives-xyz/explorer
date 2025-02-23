'use client'

import { useEffect, useState } from 'react'
import { useWallet } from "@/components/auth/wallet-context";
import { useToast } from '@/hooks/use-toast'
import { VersionedTransaction } from '@solana/web3.js';
import { useTranslations } from 'next-intl';
import { Connection } from '@solana/web3.js';

export const usePumpMint = () => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");
  const [telegram, setTelegram] = useState("");
  const [images, setImages] = useState<any>([]);
  const [mintDisable, setMintDisable] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const { walletAddress, primaryWallet } = useWallet();
  const { toast } = useToast()
  const t = useTranslations()

  const handleCreatePumpFunToken = async () => {
    if (walletAddress) {
      setCreateLoading(true)
      const imgData = images.length > 0 ? images[0].file : null
      const formData = new FormData();
      formData.append("file", imgData);
      formData.append("name", name);
      formData.append("symbol", symbol);
      formData.append("description", description);
      formData.append("website", website);
      formData.append("twitter", twitter);
      formData.append("discord", discord);
      formData.append("telegram", telegram);
      formData.append("publicKey", walletAddress);

      const response = await fetch(`/api/pump-mint`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (data.result.success) {
        const txObject = data.result.txObject
        const serializedBuffer: Buffer = Buffer.from(txObject, "base64");
        const vtx: VersionedTransaction = VersionedTransaction.deserialize(Uint8Array.from(serializedBuffer));
        console.log(vtx)
        try {
          const signer = await primaryWallet.getSigner()
          const txid = await signer.signAndSendTransaction(vtx)

          const confirmToast = toast({
            title: t('trade.confirming_transaction'),
            description: t('trade.waiting_for_confirmation'),
            variant: 'pending',
            duration: 1000000000, // Very long duration to ensure it stays visible
          })

          const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
          const tx = await connection.confirmTransaction({
            signature: txid.signature,
            ...(await connection.getLatestBlockhash()),
          })

          confirmToast.dismiss()

          if (tx.value.err) {
            toast({
              title: t('trade.transaction_failed'),
              description: t('pumpfun.the_pumpfun_token_mint_transaction_failed_please_try_again'),
              variant: 'error',
              duration: 5000,
            })
          } else {
            toast({
              title: t('trade.transaction_successful'),
              description: t(
                'pumpfun.the_pumpfun_token_mint_transaction_was_successful'
              ),
              variant: 'success',
              duration: 5000,
            })
          }
        } catch (err) {
          toast({
            title: t('pumpfun.pumpfun_token_mint_failed'),
            description: t('pumpfun.the_pumpfun_token_mint_transaction_failed_please_try_again'),
            variant: 'error',
            duration: 5000,
          })
        }
      } else {
        console.log(data.result.error)
        toast({
          title: t('pumpfun.pumpfun_token_mint_failed'),
          description: t('pumpfun.the_pumpfun_token_mint_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      }
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    const data = images.length > 0 ? images[0].file : null
    if (data == null || data == undefined || name == '' || symbol == '' || description == '' || walletAddress == null || walletAddress == '') setMintDisable(true)
    else setMintDisable(false)
  }, [name, symbol, description, images, walletAddress])

  return {
    name,
    setName,
    symbol,
    setSymbol,
    description,
    setDescription,
    website,
    setWebsite,
    twitter,
    setTwitter,
    discord,
    setDiscord,
    telegram,
    setTelegram,
    images,
    setImages,
    mintDisable,
    setMintDisable,
    createLoading,
    setCreateLoading,
    handleCreatePumpFunToken
  }
}