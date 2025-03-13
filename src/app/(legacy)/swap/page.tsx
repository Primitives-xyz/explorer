import { redirect } from 'next/navigation'

export default function SwapPage() {
  redirect('/trade?mode=swap')
}
