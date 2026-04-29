'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type ConsentData = {
  necessary: boolean
  analytics: boolean
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent')
    if (!stored) {
      setVisible(true)
    }
  }, [])

  function saveConsent(consent: ConsentData) {
    localStorage.setItem('cookie-consent', JSON.stringify(consent))
    window.dispatchEvent(new CustomEvent('cookieConsentUpdate', { detail: consent }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-zinc-300 flex-1">
          This site uses cookies for core functionality and to analyze traffic.{' '}
          <Link href="/privacy-policy" className="underline hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </p>

        {!showOptions ? (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowOptions(true)}
              className="px-4 py-2 text-sm text-zinc-300 border border-zinc-600 rounded hover:border-zinc-400 transition-colors cursor-pointer"
            >
              Options
            </button>
            <button
              onClick={() => saveConsent({ necessary: true, analytics: true })}
              className="px-4 py-2 text-sm bg-white text-black rounded hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Accept all
            </button>
          </div>
        ) : (
          <div className="flex gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => saveConsent({ necessary: true, analytics: false })}
              className="px-4 py-2 text-sm text-zinc-300 border border-zinc-600 rounded hover:border-zinc-400 transition-colors cursor-pointer"
            >
              Accept only necessary
            </button>
            <button
              onClick={() => saveConsent({ necessary: true, analytics: true })}
              className="px-4 py-2 text-sm bg-white text-black rounded hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Accept all
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
