import { redirect } from 'next/navigation'

interface SwapTokensPageProps {
  params: {
    tokens: string
  }
}

export default function SwapTokensPage({ params }: SwapTokensPageProps) {
  const { tokens } = params

  // Parse the tokens from the URL
  const tokenParts = tokens.split('_')

  if (tokenParts.length === 2) {
    const [inputToken, outputToken] = tokenParts

    // Redirect to our format
    redirect(
      `/trade?mode=swap&inputMint=${inputToken}&outputMint=${outputToken}`
    )
  }

  // If the format is invalid, redirect to the default swap page
  redirect('/trade?mode=swap')
}
