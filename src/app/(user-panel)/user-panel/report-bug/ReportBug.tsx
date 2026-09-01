import { ReportBugForm } from './ReportBugForm'

export function ReportBug({
  initialOperatingSystem,
  initialApplicationVersion,
}: {
  initialOperatingSystem: string
  initialApplicationVersion: string
}) {
  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Report a bug</h1>
        <p className="mt-1 text-sm text-gray-600">
          Send the details needed to reproduce an application problem. Your account email will be
          included automatically.
        </p>
      </div>
      <ReportBugForm
        initialOperatingSystem={initialOperatingSystem}
        initialApplicationVersion={initialApplicationVersion}
      />
    </main>
  )
}
