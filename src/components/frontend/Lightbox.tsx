'use client'
import React, { useState, useCallback, useEffect } from 'react'

export function Lightbox({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <>
      <div onClick={toggle} className="cursor-pointer">
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-8"
          onClick={toggle}
        >
          <div className="max-w-[90vw] max-h-[90vh] [&>*]:!m-0 [&>*]:max-h-[90vh] [&>*]:w-auto [&>*]:object-contain">
            {children}
          </div>
        </div>
      )}
    </>
  )
}
