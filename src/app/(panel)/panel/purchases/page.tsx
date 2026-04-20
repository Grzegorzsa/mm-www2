import type { Metadata } from 'next'
import { Purchases } from './Purchases'

export const metadata: Metadata = { title: 'Purchases — MXbeats' }

export default function PurchasesPage() {
  return <Purchases />
}
