import type { Metadata } from 'next'
import { Offers } from './Offers'

export const metadata: Metadata = { title: 'Offers — MXbeats' }

export default function OffersPage() {
  return <Offers />
}
