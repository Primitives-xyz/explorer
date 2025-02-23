import { pumpFunSDK } from '@/lib/pumpfun';
import { TransactionResult } from '@/lib/pumpfun/utils/types';
import { Keypair, PublicKey } from '@solana/web3.js';
import { error } from 'console';
import fs, { openAsBlob } from 'fs'
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string
    const symbol = formData.get('symbol') as string
    const description = formData.get('description') as string
    const twitter = formData.get('twitter') as string
    const telegram = formData.get('telegram') as string
    const website = formData.get('website') as string
    const discord = formData.get('discord') as string
    const publicKey = formData.get('publicKey') as string
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    if (!fs.existsSync('./public/uploads/')) fs.mkdirSync('./public/uploads/', { recursive: true });
    fs.writeFileSync(`./public/uploads/${file.name}`, buffer)

    const tokenMetadata: { name: string, symbol: string, description: string, website?: string, twitter?: string, telegram?: string, discord?: string, file: Blob } = {
      name,
      symbol,
      description,
      file: await openAsBlob(`./public/uploads/${file.name}`)
    }

    if (website) tokenMetadata.website = website
    if (twitter) tokenMetadata.twitter = twitter
    if (telegram) tokenMetadata.telegram = telegram
    if (discord) tokenMetadata.discord = discord

    const mintKeypair = Keypair.generate()
    const result: TransactionResult = await pumpFunSDK.create(new PublicKey(publicKey), tokenMetadata, mintKeypair)

    return NextResponse.json({ result });
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: String(err) });
  }
}