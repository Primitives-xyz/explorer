import {
  FungibleTokenInfo,
  TokenResponse,
} from '@/components/tapestry/models/token.models'

const isFungibleToken = (
  data: TokenResponse | null | undefined
): data is TokenResponse & { result: FungibleTokenInfo } => {
  return (
    !!data &&
    (data.result?.interface === 'FungibleToken' ||
      data.result?.interface === 'FungibleAsset')
  )
}

export default isFungibleToken
