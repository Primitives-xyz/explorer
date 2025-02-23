import { BN } from "bn.js";
import bs58 from 'bs58'
import { AnchorProvider, Program, Provider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet"
import {
    createAssociatedTokenAccountInstruction,
    getAccount,
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
    Commitment,
    Connection,
    Finality,
    Keypair,
    PublicKey,
    Transaction,
} from "@solana/web3.js";

import { PumpFunIDL, PumpFun } from "./utils/IDL";
import { GlobalAccount, BondingCurveAccount } from "./utils/accounts";
import {
    toCompleteEvent,
    toCreateEvent,
    toSetParamsEvent,
    toTradeEvent,
} from "./utils/events";
import {
    calculateWithSlippageBuy,
    calculateWithSlippageSell,
    sendTx,
} from "./utils";
import {
    commitmentType,
    CompleteEvent,
    CreateEvent,
    CreateTokenMetadata,
    PriorityFee,
    PumpFunEventHandlers,
    PumpFunEventType,
    SetParamsEvent,
    TradeEvent,
    TransactionResult,
} from "./utils/types";
import { SOLANA_RPC_URL } from "../constants";

class PumpFunSDK {
    public GLOBAL_ACCOUNT_SEED = "global"
    public BONDING_CURVE_SEED = "bonding-curve"
    public METADATA_SEED = "metadata"
    public PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
    public MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
    public count: number

    public program: Program<PumpFun>;
    public connection: Connection;

    constructor(provider: Provider) {
        this.program = new Program<PumpFun>(PumpFunIDL as PumpFun, provider);
        this.connection = provider.connection;
        this.count = 5
    }

    async create(
        creator: PublicKey,
        createTokenMetadata: CreateTokenMetadata,
        mint?: Keypair,
        priorityFees?: PriorityFee,
        commitment: Commitment = commitmentType.Confirmed,
        finality: Finality = commitmentType.Finalized
    ): Promise<TransactionResult> {
        const tokenMetadata: any = await this.createTokenMetadata(createTokenMetadata);
        if (!mint) mint = Keypair.generate()

        if (!tokenMetadata.metadataUri) return {
            success: false,
            data: { error: 'create meta failed' }
        }

        try {
            const createInx = await this.getCreateInstructions(
                creator,
                createTokenMetadata.name,
                createTokenMetadata.symbol,
                tokenMetadata.metadataUri,
                mint
            );

            const createTxObject = await sendTx(
                this.connection,
                [createInx],
                creator,
                [mint],
                priorityFees,
                commitment,
                finality
            );
            return {
                success: true,
                txObject: createTxObject,
                data: {
                    mint: mint.publicKey.toBase58(),
                    metadataURI: tokenMetadata.metadataUri
                }
            }
        } catch (err) {
            return {
                success: false,
                data: {
                    error: err
                }
            }
        }
    }

    async createAndBuy(
        creator: PublicKey,
        createTokenMetadata: CreateTokenMetadata,
        amount: bigint,
        slippageBasisPoints: bigint = 500n,
        priorityFees?: PriorityFee,
        mint?: Keypair,
        commitment: Commitment = commitmentType.Confirmed,
        finality: Finality = commitmentType.Finalized
    ): Promise<TransactionResult> {
        const tokenMetadata: any = await this.createTokenMetadata(createTokenMetadata);
        if (!mint) mint = Keypair.generate()

        if (!tokenMetadata.metadataUri) return {
            success: false,
            data: { error: 'create meta failed' }
        }

        if (!mint) mint = Keypair.generate()

        try {
            const createTx = await this.getCreateInstructions(
                creator,
                createTokenMetadata.name,
                createTokenMetadata.symbol,
                tokenMetadata.metadataUri,
                mint
            );

            const newTx = new Transaction().add(createTx);

            if (amount > 0) {
                const globalAccount = await this.getGlobalAccount(commitment);
                const solAmount = globalAccount.getInitialBuyPrice(amount);
                const buyAmountWithSlippage = calculateWithSlippageBuy(
                    solAmount,
                    slippageBasisPoints
                );

                const buyTx = await this.getBuyInstructions(
                    new PublicKey(creator),
                    mint.publicKey,
                    globalAccount.feeRecipient,
                    amount,
                    buyAmountWithSlippage
                );

                newTx.add(buyTx);
            }

            const createAndBuyTxObject = await sendTx(
                this.connection,
                newTx.instructions,
                creator,
                [mint],
                priorityFees,
                commitment,
                finality
            );

            return {
                success: true,
                txObject: createAndBuyTxObject,
                data: {
                    mint: mint.publicKey.toBase58(),
                    metadataURI: tokenMetadata.metadataUri
                }
            }
        } catch (err) {
            return {
                success: false,
                data: {
                    error: err
                }
            }

        }
    }

    async createTokenMetadata(create: CreateTokenMetadata) {
        const formData = new FormData();
        formData.append("file", create.file),
            formData.append("name", create.name),
            formData.append("symbol", create.symbol),
            formData.append("description", create.description),
            formData.append("twitter", create.twitter || ""),
            formData.append("telegram", create.telegram || ""),
            formData.append("website", create.website || ""),
            formData.append("discord", create.discord || ""),
            formData.append("showName", "true");
        const request = await fetch("https://pump.fun/api/ipfs", {
            method: "POST",
            headers: {
                "Host": "www.pump.fun",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Referer": "https://www.pump.fun/create",
                "Origin": "https://www.pump.fun",
                "Connection": "keep-alive",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "Priority": "u=1",
                "TE": "trailers"
            },
            body: formData,
        });
        return request.json();
    }

    async buy(
        buyer: PublicKey,
        mint: PublicKey,
        buyAmountSol: bigint,
        slippageBasisPoints: bigint = 500n,
        priorityFees?: PriorityFee,
        commitment: Commitment = commitmentType.Confirmed,
        finality: Finality = commitmentType.Finalized
    ): Promise<TransactionResult> {
        try {
            const buyTx = await this.getBuyInstructionsBySolAmount(
                buyer,
                mint,
                buyAmountSol,
                slippageBasisPoints,
                commitment
            );

            const buyResults = await sendTx(
                this.connection,
                buyTx.instructions,
                buyer,
                null,
                priorityFees,
                commitment,
                finality
            );

            return {
                success: true,
                txObject: buyResults
            }
        } catch (err) {
            return {
                success: false,
                error: err
            }

        }
    }

    async sell(
        seller: PublicKey,
        mint: PublicKey,
        sellTokenAmount: bigint,
        slippageBasisPoints: bigint = 500n,
        priorityFees?: PriorityFee,
        commitment: Commitment = commitmentType.Confirmed,
        finality: Finality = commitmentType.Finalized
    ): Promise<TransactionResult> {
        try {
            const sellTx = await this.getSellInstructionsByTokenAmount(
                seller,
                mint,
                sellTokenAmount,
                slippageBasisPoints,
                commitment
            );

            const sellResults = await sendTx(
                this.connection,
                sellTx.instructions,
                seller,
                null,
                priorityFees,
                commitment,
                finality
            );

            return {
                success: true,
                txObject: sellResults
            }
        } catch (err) {
            return {
                success: false,
                error: err
            }
        }
    }

    async getCreateInstructions(
        creator: PublicKey,
        name: string,
        symbol: string,
        uri: string,
        mint: Keypair
    ) {
        const mplTokenMetadata = this.MPL_TOKEN_METADATA_PROGRAM_ID;

        const [metadataPDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(this.METADATA_SEED),
                mplTokenMetadata.toBuffer(),
                mint.publicKey.toBuffer(),
            ],
            mplTokenMetadata
        );

        const associatedBondingCurve = await getAssociatedTokenAddress(
            mint.publicKey,
            this.getBondingCurvePDA(mint.publicKey),
            true
        );

        return this.program.methods
            .create(name, symbol, uri)
            .accounts({
                mint: mint.publicKey,
                associatedBondingCurve: associatedBondingCurve,
                metadata: metadataPDA,
                user: creator,
            })
            .signers([mint])
            .instruction();
    }

    async getBuyInstructionsBySolAmount(
        buyer: PublicKey,
        mint: PublicKey,
        buyAmountSol: bigint,
        slippageBasisPoints: bigint = 500n,
        commitment: Commitment = commitmentType.Confirmed
    ) {
        try {
            const bondingCurveAccount = await this.getBondingCurveAccount(
                mint,
                commitment
            );
            if (!bondingCurveAccount) {
                throw new Error(`Bonding curve account not found: ${mint.toBase58()} because token is already migrated to raydium`);
            }

            const buyAmount = bondingCurveAccount.getBuyPrice(buyAmountSol);
            const buyAmountWithSlippage = calculateWithSlippageBuy(
                buyAmountSol,
                slippageBasisPoints
            );

            const globalAccount = await this.getGlobalAccount(commitment);

            return await this.getBuyInstructions(
                buyer,
                mint,
                globalAccount.feeRecipient,
                buyAmount,
                buyAmountWithSlippage
            )
        } catch (err) {
            if (err instanceof Error)
                throw err.message
            else throw err
        }
    }

    async getBuyInstructions(
        buyer: PublicKey,
        mint: PublicKey,
        feeRecipient: PublicKey,
        amount: bigint,
        solAmount: bigint,
        commitment: Commitment = commitmentType.Confirmed,
    ) {
        const associatedBondingCurve = await getAssociatedTokenAddress(
            mint,
            this.getBondingCurvePDA(mint),
            true
        );

        const associatedUser = await getAssociatedTokenAddress(mint, buyer, false);

        const transaction = new Transaction();

        try {
            await getAccount(this.connection, associatedUser, commitment);
        } catch (e) {
            transaction
                // .add(SystemProgram.transfer({
                //     fromPubkey: buyer,
                //     toPubkey: treasuryWallet,
                //     lamports: BigInt(amount / BigInt(100))
                // }))
                .add(
                    createAssociatedTokenAccountInstruction(
                        buyer,
                        associatedUser,
                        buyer,
                        mint
                    )
                );
        }

        transaction.add(
            await this.program.methods
                .buy(new BN(amount.toString()), new BN(solAmount.toString()))
                .accounts({
                    feeRecipient: feeRecipient,
                    mint: mint,
                    associatedBondingCurve: associatedBondingCurve,
                    associatedUser: associatedUser,
                    user: buyer,
                })
                .transaction()
        );

        return transaction;
    }

    async getSellInstructionsByTokenAmount(
        seller: PublicKey,
        mint: PublicKey,
        sellTokenAmount: bigint,
        slippageBasisPoints: bigint = 500n,
        commitment: Commitment = commitmentType.Confirmed
    ) {
        try {
            const bondingCurveAccount = await this.getBondingCurveAccount(
                mint,
                commitment
            );
            if (!bondingCurveAccount) {
                throw new Error(`Bonding curve account not found: ${mint.toBase58()} because token is already migrated to raydium`);
            }

            const globalAccount = await this.getGlobalAccount(commitment);

            const minSolOutput = bondingCurveAccount.getSellPrice(
                sellTokenAmount,
                globalAccount.feeBasisPoints
            );

            const sellAmountWithSlippage = calculateWithSlippageSell(
                minSolOutput,
                slippageBasisPoints
            );

            return await this.getSellInstructions(
                seller,
                mint,
                globalAccount.feeRecipient,
                sellTokenAmount,
                sellAmountWithSlippage
            );
        } catch (err) {
            if (err instanceof Error)
                throw err.message
            else throw err
        }
    }

    async getSellInstructions(
        seller: PublicKey,
        mint: PublicKey,
        feeRecipient: PublicKey,
        amount: bigint,
        minSolOutput: bigint
    ) {
        const associatedBondingCurve = await getAssociatedTokenAddress(
            mint,
            this.getBondingCurvePDA(mint),
            true
        );

        const associatedUser = await getAssociatedTokenAddress(mint, seller, false);

        const transaction = new Transaction();

        transaction
            // .add(SystemProgram.transfer({
            //     fromPubkey: seller,
            //     toPubkey: treasuryWallet,
            //     lamports: BigInt(minSolOutput / BigInt(100))
            // }))
            .add(
                await this.program.methods
                    .sell(new BN(amount.toString()), new BN(minSolOutput.toString()))
                    .accounts({
                        feeRecipient: feeRecipient,
                        mint: mint,
                        associatedBondingCurve: associatedBondingCurve,
                        associatedUser: associatedUser,
                        user: seller,
                    })
                    .transaction()
            );
        return transaction;
    }

    async getBondingCurveAccount(
        mint: PublicKey,
        commitment: Commitment = commitmentType.Confirmed
    ) {
        const tokenAccount = await this.connection.getAccountInfo(
            this.getBondingCurvePDA(mint),
            commitment
        );
        if (!tokenAccount) {
            return null;
        }
        return BondingCurveAccount.fromBuffer(tokenAccount!.data);
    }

    async getGlobalAccount(commitment: Commitment = commitmentType.Confirmed) {
        const [globalAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from(this.GLOBAL_ACCOUNT_SEED)],
            this.PROGRAM_ID
        );

        const tokenAccount = await this.connection.getAccountInfo(
            globalAccountPDA,
            commitment
        );

        return GlobalAccount.fromBuffer(tokenAccount!.data);
    }

    getBondingCurvePDA(mint: PublicKey) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from(this.BONDING_CURVE_SEED), mint.toBuffer()],
            this.program.programId
        )[0];
    }

    addEventListener<T extends PumpFunEventType>(
        eventType: T,
        callback: (
            event: PumpFunEventHandlers[T],
            slot: number,
            signature: string
        ) => void
    ) {
        return this.program.addEventListener(
            eventType,
            (event: any, slot: number, signature: string) => {
                let processedEvent;
                switch (eventType) {
                    case "createEvent":
                        processedEvent = toCreateEvent(event as CreateEvent);
                        callback(
                            processedEvent as PumpFunEventHandlers[T],
                            slot,
                            signature
                        );
                        break;
                    case "tradeEvent":
                        processedEvent = toTradeEvent(event as TradeEvent);
                        callback(
                            processedEvent as PumpFunEventHandlers[T],
                            slot,
                            signature
                        );
                        break;
                    case "completeEvent":
                        processedEvent = toCompleteEvent(event as CompleteEvent);
                        callback(
                            processedEvent as PumpFunEventHandlers[T],
                            slot,
                            signature
                        );
                        console.log("completeEvent", event, slot, signature);
                        break;
                    case "setParamsEvent":
                        processedEvent = toSetParamsEvent(event as SetParamsEvent);
                        callback(
                            processedEvent as PumpFunEventHandlers[T],
                            slot,
                            signature
                        );
                        break;
                    default:
                        console.error("Unhandled event type:", eventType);
                }
            }
        );
    }

    removeEventListener(eventId: number) {
        this.program.removeEventListener(eventId);
    }
}

const mainKeypair = Keypair.generate()
const wallet = new NodeWallet(mainKeypair)
const connection = new Connection(SOLANA_RPC_URL, 'confirmed')
const provider = new AnchorProvider(connection, wallet, { commitment: "finalized", });

export const pumpFunSDK = new PumpFunSDK(provider)