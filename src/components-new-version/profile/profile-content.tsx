import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'

interface Props {
  id: string
}

export function ProfileContent({ id }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Wallets&</CardTitle>
        <CardContent>lol</CardContent>
      </CardHeader>
    </Card>
  )
}
