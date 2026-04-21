import type { Metadata } from 'next'
import { Installations } from './Installations'

export const metadata: Metadata = { title: 'Installations — MXbeats' }

export default function InstallationsPage() {
  return <Installations />
}
