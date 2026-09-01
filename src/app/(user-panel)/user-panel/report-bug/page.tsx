import type { Metadata } from 'next'
import { ReportBug } from './ReportBug'

export const metadata: Metadata = { title: 'Report a Bug — MXbeats' }

export default function ReportBugPage() {
  return <ReportBug />
}
