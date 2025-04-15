'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading2,
  Heading3,
  Paragraph,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Label,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useCurrentWallet } from '@/utils/use-current-wallet'

// Conversion constants
const MILLION = 1_000_000;
const BILLION = 1_000_000_000;

const launchTokenSchema = z.object({
  tokenName: z.string().min(1, 'Token name is required'),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  initialTokenReserves: z.number().positive('Initial supply must be positive'),
  shift: z.number().positive('Virtual SOL amount must be positive'),
  decimals: z.coerce.number().min(0).max(9).optional().default(9),
  royaltiesBps: z.coerce.number().min(0).max(10000).optional().default(100),
})

const buyTokensSchema = z.object({
  poolOwner: z.string().min(1, 'Pool owner address is required'),
  mintB: z.string().min(1, 'Token mint address is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  slippageBps: z.coerce.number().min(0).max(10000).optional().default(50),
})

const sellTokensSchema = z.object({
  poolOwner: z.string().min(1, 'Pool owner address is required'),
  mintB: z.string().min(1, 'Token mint address is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  slippageBps: z.coerce.number().min(0).max(10000).optional().default(50),
})

const claimRoyaltiesSchema = z.object({
  poolAddress: z.string().min(1, 'Pool address is required'),
})

// Component for number inputs with autocomplete suggestions
type NumberWithAutocompleteProps = {
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

const NumberWithAutocomplete = ({ value, onChange, placeholder, className }: NumberWithAutocompleteProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize the input with the provided value
  useEffect(() => {
    const initialValue = typeof value === 'number' 
      ? formatNumberWithCommas(value)
      : value.toString();
    setInputValue(initialValue);
    setDisplayValue(initialValue);
  }, []);

  // Format numbers with commas
  const formatNumberWithCommas = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Generate suggestions based on input
  const generateSuggestions = (input: string): string[] => {
    const cleanedInput = input.toLowerCase().trim();
    const results: string[] = [];

    // Generate million/billion suggestions if input contains 'm' or 'b'
    if (cleanedInput.match(/^\d+(\.\d+)?\s*m/)) {
      const numPart = parseFloat(cleanedInput.replace(/m.*/, '').trim());
      if (!isNaN(numPart)) {
        results.push(`${numPart} million (${formatNumberWithCommas(numPart * MILLION)})`);
      }
    }
    
    if (cleanedInput.match(/^\d+(\.\d+)?\s*b/)) {
      const numPart = parseFloat(cleanedInput.replace(/b.*/, '').trim());
      if (!isNaN(numPart)) {
        results.push(`${numPart} billion (${formatNumberWithCommas(numPart * BILLION)})`);
      }
    }

    return results;
  };

  // Parse the display value to get the numeric value
  const parseValue = (displayVal: string): number | null => {
    // Match patterns like "10 million (10,000,000)" and extract the number in parentheses
    const match = displayVal.match(/\(([^)]+)\)/);
    if (match) {
      // If we have a formatted number in parentheses, remove commas and parse
      const numericStr = match[1].replace(/,/g, '');
      return parseFloat(numericStr);
    }

    // For direct numeric input
    const cleanedValue = displayVal.replace(/,/g, '').toLowerCase().trim();
    
    // Check for million/billion without the formatting
    if (cleanedValue.includes('million')) {
      const numPart = parseFloat(cleanedValue.replace('million', '').trim());
      return isNaN(numPart) ? null : numPart * MILLION;
    }
    
    if (cleanedValue.includes('billion')) {
      const numPart = parseFloat(cleanedValue.replace('billion', '').trim());
      return isNaN(numPart) ? null : numPart * BILLION;
    }
    
    // Regular number
    return parseFloat(cleanedValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setDisplayValue(newValue);
    
    const newSuggestions = generateSuggestions(newValue);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    
    // If it's a plain number, update the actual value
    const parsedValue = parseValue(newValue);
    if (parsedValue !== null) {
      onChange(parsedValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDisplayValue(suggestion);
    setShowSuggestions(false);
    
    const parsedValue = parseValue(suggestion);
    if (parsedValue !== null) {
      onChange(parsedValue);
    }
  };

  const handleBlur = () => {
    // Short delay to allow click on suggestion to work
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
    
    // If the value is valid, make sure the numeric value is updated
    const parsedValue = parseValue(displayValue);
    if (parsedValue !== null) {
      onChange(parsedValue);
    }
  };

  const handleFocus = () => {
    const newSuggestions = generateSuggestions(inputValue);
    if (newSuggestions.length > 0) {
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-md border border-input">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2 hover:bg-accent cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const LaunchPad = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { walletAddress, isLoggedIn, setShowAuthFlow } = useCurrentWallet()
  
  // Launch Token Form
  const launchForm = useForm<z.infer<typeof launchTokenSchema>>({
    resolver: zodResolver(launchTokenSchema),
    defaultValues: {
      initialTokenReserves: 1_000_000_000,
      shift: 100,
      decimals: 9,
      royaltiesBps: 100,
    },
  })

  // Buy Tokens Form
  const buyForm = useForm<z.infer<typeof buyTokensSchema>>({
    resolver: zodResolver(buyTokensSchema),
    defaultValues: {
      slippageBps: 50,
    },
  })

  // Sell Tokens Form
  const sellForm = useForm<z.infer<typeof sellTokensSchema>>({
    resolver: zodResolver(sellTokensSchema),
    defaultValues: {
      slippageBps: 50,
    },
  })

  // Claim Royalties Form
  const claimForm = useForm<z.infer<typeof claimRoyaltiesSchema>>({
    resolver: zodResolver(claimRoyaltiesSchema),
  })

  // Custom handler for initialTokenReserves
  const handleInitialTokenReservesChange = (value: number) => {
    launchForm.setValue('initialTokenReserves', value);
  };

  // Custom handler for shift
  const handleShiftChange = (value: number) => {
    launchForm.setValue('shift', value);
  };

  const onLaunchSubmit = async (values: z.infer<typeof launchTokenSchema>) => {
    setIsLoading(true)
    
    // Check if wallet is connected
    if (!isLoggedIn || !walletAddress) {
      toast.error('Please connect your wallet first')
      setShowAuthFlow?.(true)
      setIsLoading(false)
      return
    }
    
    try {
      // Create URL with search params for token details
      const params = new URLSearchParams()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
      
      // Use POST method with account in body
      const response = await fetch(`/api/actions/vertigo/launch-pool?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: walletAddress,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.log(errorData)
        throw new Error(errorData.error || 'Failed to launch token pool')
      }
      
      const data = await response.json()
      toast.success('Token pool launched successfully!')
      console.log('Launch response:', data)
    } catch (error) {
      console.error('Error launching token pool:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to launch token pool')
    } finally {
      setIsLoading(false)
    }
  }

  const onBuySubmit = async (values: z.infer<typeof buyTokensSchema>) => {
    setIsLoading(true)
    
    // Check if wallet is connected
    if (!isLoggedIn || !walletAddress) {
      toast.error('Please connect your wallet first')
      setShowAuthFlow?.(true)
      setIsLoading(false)
      return
    }
    
    try {
      // Create URL with search params for token details
      const params = new URLSearchParams()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
      
      // Use POST method with account in body
      const response = await fetch(`/api/actions/vertigo/buy-tokens?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: walletAddress,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to buy tokens')
      }
      
      const data = await response.json()
      toast.success('Tokens purchased successfully!')
      console.log('Buy response:', data)
    } catch (error) {
      console.error('Error buying tokens:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to buy tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const onSellSubmit = async (values: z.infer<typeof sellTokensSchema>) => {
    setIsLoading(true)
    
    // Check if wallet is connected
    if (!isLoggedIn || !walletAddress) {
      toast.error('Please connect your wallet first')
      setShowAuthFlow?.(true)
      setIsLoading(false)
      return
    }
    
    try {
      // Create URL with search params for token details
      const params = new URLSearchParams()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
      
      // Use POST method with account in body
      const response = await fetch(`/api/actions/vertigo/sell-tokens?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: walletAddress,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sell tokens')
      }
      
      const data = await response.json()
      toast.success('Tokens sold successfully!')
      console.log('Sell response:', data)
    } catch (error) {
      console.error('Error selling tokens:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to sell tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const onClaimSubmit = async (values: z.infer<typeof claimRoyaltiesSchema>) => {
    setIsLoading(true)
    
    // Check if wallet is connected
    if (!isLoggedIn || !walletAddress) {
      toast.error('Please connect your wallet first')
      setShowAuthFlow?.(true)
      setIsLoading(false)
      return
    }
    
    try {
      // Create URL with search params for token details
      const params = new URLSearchParams()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
      
      // Use POST method with account in body
      const response = await fetch(`/api/actions/vertigo/claim-royalties?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: walletAddress,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to claim royalties')
      }
      
      const data = await response.json()
      toast.success('Royalties claimed successfully!')
      console.log('Claim response:', data)
    } catch (error) {
      console.error('Error claiming royalties:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to claim royalties')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Heading2 className="mb-4">Vertigo Token Launcher</Heading2>
        <Paragraph className="mb-6">
          Launch, buy, sell tokens and claim royalties using the Vertigo AMM.
        </Paragraph>
        
        {!isLoggedIn && (
          <Card className="mb-6 border-amber-400/50 bg-amber-50/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span className="text-amber-400 font-medium">Wallet not connected</span>
              </div>
              <p className="text-sm mt-2 mb-4">You need to connect your wallet to launch tokens and use other features.</p>
              <Button size="sm" variant="outline" onClick={() => setShowAuthFlow?.(true)}>
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="launch">
        <TabsList className="mb-6">
          <TabsTrigger value="launch">Launch Token</TabsTrigger>
          <TabsTrigger value="buy">Buy Tokens</TabsTrigger>
          <TabsTrigger value="sell">Sell Tokens</TabsTrigger>
          <TabsTrigger value="claim">Claim Royalties</TabsTrigger>
        </TabsList>

        {/* Launch Token Form */}
        <TabsContent value="launch">
          <Card>
            <CardHeader>
              <CardTitle>Launch a Token Pool</CardTitle>
              <CardDescription>
                Create a new tradable token on the Vertigo AMM.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...launchForm}>
                <form onSubmit={launchForm.handleSubmit(onLaunchSubmit)} className="space-y-4">
                  <FormField
                    control={launchForm.control}
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
                    control={launchForm.control}
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
                    control={launchForm.control}
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
                    control={launchForm.control}
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
                    control={launchForm.control}
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
                    control={launchForm.control}
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
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Launching..." : "Launch Token"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buy Tokens Form */}
        <TabsContent value="buy">
          <Card>
            <CardHeader>
              <CardTitle>Buy Tokens</CardTitle>
              <CardDescription>
                Purchase tokens from a Vertigo pool with SOL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...buyForm}>
                <form onSubmit={buyForm.handleSubmit(onBuySubmit)} className="space-y-4">
                  <FormField
                    control={buyForm.control}
                    name="poolOwner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pool Owner Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Pool owner public key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={buyForm.control}
                    name="mintB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Mint Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Token mint public key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={buyForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SOL Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={buyForm.control}
                    name="slippageBps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slippage Tolerance (Basis Points)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} />
                        </FormControl>
                        <FormDescription>
                          Default: 50 (0.5%)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Buying..." : "Buy Tokens"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sell Tokens Form */}
        <TabsContent value="sell">
          <Card>
            <CardHeader>
              <CardTitle>Sell Tokens</CardTitle>
              <CardDescription>
                Sell tokens back to a Vertigo pool for SOL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...sellForm}>
                <form onSubmit={sellForm.handleSubmit(onSellSubmit)} className="space-y-4">
                  <FormField
                    control={sellForm.control}
                    name="poolOwner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pool Owner Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Pool owner public key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={sellForm.control}
                    name="mintB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Mint Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Token mint public key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={sellForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={sellForm.control}
                    name="slippageBps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slippage Tolerance (Basis Points)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} />
                        </FormControl>
                        <FormDescription>
                          Default: 50 (0.5%)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Selling..." : "Sell Tokens"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claim Royalties Form */}
        <TabsContent value="claim">
          <Card>
            <CardHeader>
              <CardTitle>Claim Royalties</CardTitle>
              <CardDescription>
                Claim your royalties from a Vertigo pool.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...claimForm}>
                <form onSubmit={claimForm.handleSubmit(onClaimSubmit)} className="space-y-4">
                  <FormField
                    control={claimForm.control}
                    name="poolAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pool Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Pool public key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Claiming..." : "Claim Royalties"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 