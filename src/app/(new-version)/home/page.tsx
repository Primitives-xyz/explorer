import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/components-new-version/ui/card'

export default async function Home() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>today’s summary</CardTitle>
      </CardHeader>
      <CardContent>content</CardContent>
    </Card>
  )
}
