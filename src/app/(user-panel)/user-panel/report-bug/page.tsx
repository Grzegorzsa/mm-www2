import type { Metadata } from 'next'
import { ReportBug } from './ReportBug'

export const metadata: Metadata = { title: 'Report a Bug — MXbeats' }

export default async function ReportBugPage({
  searchParams,
}: {
  searchParams: Promise<{ os?: string | string[]; app?: string | string[] }>
}) {
  const params = await searchParams
  const operatingSystem = Array.isArray(params.os) ? params.os[0] : params.os
  const applicationVersion = Array.isArray(params.app) ? params.app[0] : params.app

  return (
    <ReportBug
      initialOperatingSystem={operatingSystem?.slice(0, 200) ?? ''}
      initialApplicationVersion={applicationVersion?.slice(0, 100) ?? ''}
    />
  )
}
