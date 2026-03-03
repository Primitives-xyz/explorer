import { InvestigateAddress } from '@/components/investigate/investigate-address'

interface Props {
  params: Promise<{ address: string }>
}

export default async function InvestigateAddressPage({ params }: Props) {
  const { address } = await params
  return <InvestigateAddress address={address} />
}
