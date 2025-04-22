'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  ButtonInputFile,
  ButtonVariant,
} from '@/components/ui'
import { NumberWithAutocomplete } from '@/components/shared/NumberWithAutocomplete'
import { UploadIcon, RocketIcon, DollarSignIcon, CoinsIcon, PercentIcon } from 'lucide-react'
import Image from 'next/image'
import { LaunchTokenData, launchTokenSchema } from '@/components/launch/hooks/use-launch'
import { useFileUpload } from '@/components/launch/hooks/use-file-upload'
import { useLaunch } from '@/components/launch/hooks/use-launch'

interface Props {
  onSubmit: (values: LaunchTokenData) => void
  isLoading: boolean
  tapAddressAttempts: number
}

export function LaunchForm({ onSubmit, isLoading, tapAddressAttempts }: Props) {
  const form = useForm<LaunchTokenData>({
    resolver: zodResolver(launchTokenSchema),
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      initialTokenReserves: 1_000_000_000,
      shift: 100,
      initialDevBuy: 0,
      decimals: 9,
      royaltiesBps: 100,
      useTapAddress: false,
    },
  })

  // Get the currentStep from useLaunch hook
  const { currentStep } = useLaunch()

  const { uploadLoading, onFileChange, UploadFilesModal } = useFileUpload((imageUrl) => {
    form.setValue('tokenImage', imageUrl)
  })

  // Custom handler for initialTokenReserves
  const handleInitialTokenReservesChange = (value: number) => {
    form.setValue('initialTokenReserves', value)
  }

  // Custom handler for shift
  const handleShiftChange = (value: number) => {
    form.setValue('shift', value)
  }

  // Custom handler for initialDevBuy
  const handleInitialDevBuyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Parse the string to a number
    const value = parseFloat(e.target.value)
    // Set the value only if it's a valid number, otherwise set to 0
    form.setValue('initialDevBuy', isNaN(value) ? 0 : value)
  }

  // Calculate estimated market cap
  const calculateEstimatedMarketCap = () => {
    const initialSupply = form.getValues('initialTokenReserves') || 0
    const virtualSol = form.getValues('shift') || 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(virtualSol * 100) // Assuming SOL price of $100 for estimate
  }

  // Determine the current status message for the button
  const getStatusMessage = () => {
    if (currentStep === 'finding_tap_address') return "Finding TAP Address..."
    if (currentStep === 'minting_token') return "Minting Coin..."
    if (currentStep === 'launching_pool') return "Launching Pool..."
    if (currentStep === 'paying_fee') return "Processing Payment..."
    if (isLoading) return "Processing..."
    return "Launch Coin 🚀"
  }
  
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create Your Coin</h2>
        <p className="text-muted-foreground">Define your coin and launch it to the market instantly.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-muted/20 p-6 rounded-lg border border-primary/10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CoinsIcon size={20} className="text-primary" />
              Coin Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tokenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coin Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Give your coin a memorable name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tokenSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coin Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="3-4 letters (e.g. BTC, SOL, PEPE)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decimals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decimals</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="9" min="0" max="9" {...field} />
                      </FormControl>
                      <FormDescription>
                        Standard: 9 (Like most coins)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tokenImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coin Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value ? (
                            <div className="bg-muted rounded-lg w-[160px] aspect-square overflow-hidden border-2 border-primary/50">
                              <Image
                                src={field.value}
                                alt="Coin Image"
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="bg-muted/30 rounded-lg w-[160px] aspect-square flex items-center justify-center border border-dashed">
                              <span className="text-muted-foreground text-sm">No image yet</span>
                            </div>
                          )}
                          <ButtonInputFile
                            onFileChange={onFileChange}
                            disabled={uploadLoading}
                            variant={ButtonVariant.OUTLINE}
                          >
                            <UploadIcon size={18} className="mr-1" /> {field.value ? 'Change Image' : 'Upload Logo'}
                          </ButtonInputFile>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Make your coin stand out with a unique logo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="bg-muted/20 p-6 rounded-lg border border-primary/10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSignIcon size={20} className="text-primary" />
              Launch Economics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormField
                  control={form.control}
                  name="initialTokenReserves"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Supply</FormLabel>
                      <FormControl>
                        <NumberWithAutocomplete
                          value={field.value}
                          onChange={handleInitialTokenReservesChange}
                          placeholder="1 billion"
                        />
                      </FormControl>
                      <FormDescription>
                        Try typing "10 m" for million or "1.5 b" for billion
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="shift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Market Cap (in SOL)</FormLabel>
                      <FormControl>
                        <NumberWithAutocomplete
                          value={field.value}
                          onChange={handleShiftChange}
                          placeholder="100"
                        />
                      </FormControl>
                      <FormDescription>
                        Est. value: {calculateEstimatedMarketCap()}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="royaltiesBps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <PercentIcon size={16} className="text-primary" />
                      Transaction Fee
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          placeholder="100" 
                          {...field} 
                          className="max-w-[200px]"
                        />
                        <span className="text-sm text-muted-foreground">basis points = {(field.value || 0)/100}%</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Fee paid to you on every transaction (Default: 100 bps = 1%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialDevBuy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <DollarSignIcon size={16} className="text-primary" />
                      Initial Purchase (SOL)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.01" 
                        min="0"
                        step="0.01"
                        onChange={handleInitialDevBuyChange}
                        value={field.value}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        className="max-w-[200px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Amount of SOL you'll use for your first purchase (0 for no purchase)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-muted/20 p-6 rounded-lg border border-primary/10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <RocketIcon size={20} className="text-primary" />
              Launch Options
            </h3>
            <FormField
              control={form.control}
              name="useTapAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background/50">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="w-4 h-4 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Premium "TAP" Address</FormLabel>
                    <FormDescription>
                      Generate a memorable coin address ending with "tap" (may take longer to create)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          {/* Status messages for different stages */}
          {currentStep === 'finding_tap_address' && (
            <div className="bg-primary/10 p-4 rounded-md border border-primary/20 animate-pulse">
              <p className="text-sm font-medium">Finding a premium address ending with "tap"...</p>
              <p className="text-xs mt-1">Attempts: {tapAddressAttempts} (This may take a few minutes)</p>
            </div>
          )}
          
          {currentStep === 'minting_token' && (
            <div className="bg-blue-50/10 border border-blue-400/50 p-4 rounded-md animate-pulse">
              <p className="text-sm font-medium text-blue-600">Minting your coin...</p>
              <p className="text-xs mt-1">Creating your {form.getValues('tokenName')} coin on the blockchain</p>
            </div>
          )}
          
          {currentStep === 'launching_pool' && (
            <div className="bg-indigo-50/10 border border-indigo-400/50 p-4 rounded-md animate-pulse">
              <p className="text-sm font-medium text-indigo-600">Launching liquidity pool...</p>
              <p className="text-xs mt-1">Creating a trading pool for {form.getValues('tokenSymbol')} - your coin will be live after this step!</p>
            </div>
          )}
          
          {currentStep === 'paying_fee' && (
            <div className="bg-green-50/10 border border-green-400/50 p-4 rounded-md animate-pulse">
              <p className="text-sm font-medium text-green-600">Processing payment...</p>
              <p className="text-xs mt-1">Paying platform fee to create your {form.getValues('tokenSymbol')} coin</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading || uploadLoading || currentStep !== null}
            className="w-full py-6 text-lg"
          >
            {getStatusMessage()}
          </Button>

          {!isLoading && !uploadLoading && currentStep === null && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Your coin will be immediately available for trading once launched
            </p>
          )}
        </form>
      </Form>
      {UploadFilesModal}
    </>
  )
} 