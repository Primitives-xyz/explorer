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
import { UploadIcon } from 'lucide-react'
import Image from 'next/image'
import { LaunchTokenData, launchTokenSchema } from '@/components/launch/hooks/use-launch'
import { useFileUpload } from '@/components/launch/hooks/use-file-upload'
import { useLaunch } from '@/components/launch/hooks/use-launch'

interface Props {
  onSubmit: (values: LaunchTokenData) => void
  isLoading: boolean
  findingTapAddress: boolean
  tapAddressAttempts: number
}

export function LaunchForm({ onSubmit, isLoading, findingTapAddress, tapAddressAttempts }: Props) {
  const form = useForm<LaunchTokenData>({
    resolver: zodResolver(launchTokenSchema),
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      initialTokenReserves: 1_000_000_000,
      shift: 100,
      decimals: 9,
      royaltiesBps: 100,
      useTapAddress: false,
    },
  })

  // Get the launchingPool and mintingToken states from useLaunch hook
  const { mintingToken, launchingPool } = useLaunch()

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

  // Determine the current status message for the button
  const getStatusMessage = () => {
    if (findingTapAddress) return "Finding TAP Address..."
    if (mintingToken) return "Minting Token..."
    if (launchingPool) return "Launching Pool..."
    if (isLoading) return "Processing..."
    return "Launch Token"
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="tokenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Token" {...field} />
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
                    <FormLabel>Token Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="MTK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                      Try typing "10 m" or "1.5 b" for suggestions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Virtual SOL Amount</FormLabel>
                    <FormControl>
                      <NumberWithAutocomplete
                        value={field.value}
                        onChange={handleShiftChange}
                        placeholder="100"
                      />
                    </FormControl>
                    <FormDescription>
                      Default: 100 (Try "100 m" for million)
                    </FormDescription>
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
                      Default: 9
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="royaltiesBps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Royalty Fees (Basis Points)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormDescription>
                      Default: 100 (1%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="useTapAddress"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        className="w-4 h-4 mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Use TAP Address</FormLabel>
                      <FormDescription>
                        Generate a token address ending with "tap"
                      </FormDescription>
                    </div>
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
                    <FormLabel>Token Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {field.value && (
                          <div className="bg-muted rounded-lg w-[160px] aspect-square overflow-hidden">
                            <Image
                              src={field.value}
                              alt="Token Image"
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <ButtonInputFile
                          onFileChange={onFileChange}
                          disabled={uploadLoading}
                          variant={ButtonVariant.OUTLINE}
                        >
                          <UploadIcon size={18} /> Upload Image
                        </ButtonInputFile>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for your token (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Status messages for different stages */}
          {findingTapAddress && (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium">Finding an address ending with "tap"...</p>
              <p className="text-xs mt-1">Attempts: {tapAddressAttempts}</p>
            </div>
          )}
          
          {mintingToken && (
            <div className="bg-blue-50/10 border border-blue-400/50 p-4 rounded-md">
              <p className="text-sm font-medium text-blue-600">Minting your token...</p>
              <p className="text-xs mt-1">Creating your {form.getValues('tokenName')} token</p>
            </div>
          )}
          
          {launchingPool && (
            <div className="bg-indigo-50/10 border border-indigo-400/50 p-4 rounded-md">
              <p className="text-sm font-medium text-indigo-600">Launching liquidity pool...</p>
              <p className="text-xs mt-1">Creating a pool for {form.getValues('tokenSymbol')}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isLoading || uploadLoading || findingTapAddress || mintingToken || launchingPool}
          >
            {getStatusMessage()}
          </Button>
        </form>
      </Form>
      {UploadFilesModal}
    </>
  )
} 