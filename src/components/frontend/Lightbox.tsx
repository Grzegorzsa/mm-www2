'use client'
import { useState, useEffect, useCallback } from 'react'

/**
 * Global lightbox overlay using event delegation.
 * Automatically opens for any <img> or <video> with CSS `cursor: pointer`.
 * Place once in the layout — no per-element wrappers needed.
 */
export function Lightbox() {
  const [media, setMedia] = useState<{ src: string; type: 'image' | 'video' } | null>(null)

  const close = useCallback(() => setMedia(null), [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const el = target.closest('img, video') as HTMLElement | null
      if (!el) return

      if (getComputedStyle(el).cursor !== 'pointer') return

      e.preventDefault()
      e.stopPropagation()

      if (el instanceof HTMLImageElement) {
        setMedia({ src: el.src, type: 'image' })
      } else if (el instanceof HTMLVideoElement) {
        const source = el.querySelector('source') as HTMLSourceElement | null
        const src = source?.src || el.src
        if (src) setMedia({ src, type: 'video' })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => {
    if (!media) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [media, close])

  if (!media) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-8 cursor-default"
      onClick={close}
    >
      {media.type === 'video' ? (
        <video
          src={media.src}
          autoPlay
          muted
          loop
          playsInline
          className="max-w-[90vw] max-h-[90vh] object-contain pointer-events-none"
        />
      ) : (
        <img src={media.src} className="max-w-[90vw] max-h-[90vh] object-contain" alt="" />
      )}
    </div>
  )
}
