'use client'
import Script from 'next/script'
import { useEffect } from 'react'

const GA_ID = 'G-WSWE6V5H4V'

function getAnalyticsConsent(): boolean {
  try {
    const stored = localStorage.getItem('cookie-consent')
    if (!stored) return false
    return JSON.parse(stored).analytics === true
  } catch {
    return false
  }
}

function updateGtagConsent(granted: boolean) {
  if (typeof window === 'undefined' || !('gtag' in window)) return
  const state = granted ? 'granted' : 'denied'
  ;(window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('consent', 'update', {
    analytics_storage: state,
  })
}

export function GoogleAnalytics() {
  useEffect(() => {
    // Apply stored consent on mount
    updateGtagConsent(getAnalyticsConsent())

    function handleConsentUpdate(e: Event) {
      const consent = (e as CustomEvent<{ analytics: boolean }>).detail
      updateGtagConsent(consent.analytics === true)
    }

    window.addEventListener('cookieConsentUpdate', handleConsentUpdate)
    return () => window.removeEventListener('cookieConsentUpdate', handleConsentUpdate)
  }, [])

  return (
    <>
      {/* Consent Mode v2: default denied — anonymous pings only until user accepts */}
      <Script id="gtag-consent-init" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          wait_for_update: 500,
        });
      `}</Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">{`
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
    </>
  )
}
