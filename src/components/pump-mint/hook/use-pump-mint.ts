'use client'

import { useEffect, useState } from 'react'
import { useWallet } from "@/components/auth/wallet-context";

export const usePumpMint = () => {
  const [name, setName] = useState("NAME");
  const [symbol, setSymbol] = useState("SYMBOL");
  const [description, setDescription] = useState("description");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");
  const [telegram, setTelegram] = useState("");
  const [images, setImages] = useState<any>([]);
  const [mintDisable, setMintDisable] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const { walletAddress } = useWallet();

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