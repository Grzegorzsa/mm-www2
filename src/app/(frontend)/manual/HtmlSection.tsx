'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function HtmlSection({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (!ref.current) return
    ref.current.querySelectorAll('video').forEach((video) => {
      video.muted = true
      video.setAttribute('playsinline', '')
      video.load()
      video.play().catch(() => {})
    })
  }, [html, pathname])

  return <section ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
}
