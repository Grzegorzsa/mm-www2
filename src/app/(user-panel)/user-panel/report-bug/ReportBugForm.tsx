'use client'

import { ImagePlus, Send } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'

const MAX_SCREENSHOTS = 4
const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024
const MAX_TOTAL_SCREENSHOT_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/15'

export function ReportBugForm() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [operatingSystem, setOperatingSystem] = useState('')
  const [applicationVersion, setApplicationVersion] = useState('')
  const [description, setDescription] = useState('')
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  function handleScreenshotsChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    const totalSize = files.reduce((total, file) => total + file.size, 0)

    if (
      files.length > MAX_SCREENSHOTS ||
      files.some(
        (file) => !ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_SCREENSHOT_SIZE,
      ) ||
      totalSize > MAX_TOTAL_SCREENSHOT_SIZE
    ) {
      setError('Attach up to 4 JPG, PNG, or WebP images, up to 5 MB each and 10 MB total.')
      event.target.value = ''
      setScreenshots([])
      return
    }

    setError('')
    setScreenshots(files)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.set('operatingSystem', operatingSystem)
      formData.set('applicationVersion', applicationVersion)
      formData.set('description', description)
      screenshots.forEach((screenshot) => formData.append('screenshots', screenshot))

      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error ?? 'The report could not be sent.')
      }

      setSent(true)
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : 'The report could not be sent.')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-2xl rounded-lg border border-green-200 bg-green-50 p-6 text-green-900">
        <h2 className="text-base font-semibold">Report sent</h2>
        <p className="mt-1 text-sm">
          Thank you. If we need more details, we'll reach out by email.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-5 rounded-lg border border-gray-200 bg-white p-6"
    >
      {error ? (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="operatingSystem" className="mb-1 block text-sm font-medium text-gray-700">
          Operating system and version <span className="text-red-500">*</span>
        </label>
        <input
          id="operatingSystem"
          value={operatingSystem}
          onChange={(event) => setOperatingSystem(event.target.value)}
          placeholder="e.g. Windows 11 23H2 or macOS 15.1"
          maxLength={200}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="applicationVersion"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Application version <span className="text-red-500">*</span>
        </label>
        <input
          id="applicationVersion"
          value={applicationVersion}
          onChange={(event) => setApplicationVersion(event.target.value)}
          placeholder="e.g. MX GRID 1.2.3"
          maxLength={100}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Error description and reproduction steps <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what happened, what you expected, and the exact steps needed to reproduce the problem."
          rows={9}
          maxLength={10_000}
          required
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="screenshots" className="mb-1 block text-sm font-medium text-gray-700">
          Screenshots
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-24 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-5 text-sm font-medium text-gray-700 hover:border-gray-500 hover:bg-gray-50"
        >
          <ImagePlus size={20} aria-hidden="true" />
          Choose screenshots
        </button>
        <input
          ref={fileInputRef}
          id="screenshots"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleScreenshotsChange}
          className="sr-only"
        />
        <p className="mt-1 text-xs text-gray-500">
          Up to 4 JPG, PNG, or WebP images; 5 MB each and 10 MB total.
        </p>
        {screenshots.length > 0 ? (
          <div className="mt-3 flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-3">
            <ul className="min-w-0 space-y-1 text-xs text-gray-700">
              {screenshots.map((screenshot) => (
                <li key={`${screenshot.name}-${screenshot.lastModified}`} className="truncate">
                  {screenshot.name} ({(screenshot.size / 1024 / 1024).toFixed(1)} MB)
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setScreenshots([])
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="shrink-0 text-xs font-medium text-gray-600 underline hover:text-gray-900"
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded bg-black px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={16} aria-hidden="true" />
        {isLoading ? 'Sending…' : 'Send report'}
      </button>
    </form>
  )
}
