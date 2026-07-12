'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { sanitizeManualHtml } from '@/lib/manualHtml'

export default function HtmlSection({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const sanitizedHtml = sanitizeManualHtml(html)

  useEffect(() => {
    if (!ref.current) return
    ref.current.querySelectorAll('video').forEach((video) => {
      video.muted = true
      video.setAttribute('playsinline', '')
      video.load()
      video.play().catch(() => {})
    })
  }, [sanitizedHtml, pathname])

  return (
    <section ref={ref} className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
  )
}
