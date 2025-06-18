import { DialectAppPage } from '@/components/dialect-app/dialect-app-page'

export default async function AppPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params

  return <DialectAppPage id={name} />
}
