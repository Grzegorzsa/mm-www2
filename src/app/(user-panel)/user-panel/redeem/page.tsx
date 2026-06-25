import type { Metadata } from 'next'
import { Redeem } from './Redeem'

export const metadata: Metadata = { title: 'Redeem — MXbeats' }

export default function RedeemPage() {
  return <Redeem />
}
