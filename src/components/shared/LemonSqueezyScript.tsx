'use client'

import Script from 'next/script'

export function LemonSqueezyScript() {
  return (
    <Script
      id="lemon-squeezy-sdk"
      src="https://app.lemonsqueezy.com/js/lemon.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined' && typeof window.createLemonSqueezy === 'function') {
          window.createLemonSqueezy()
        }
      }}
    />
  )
}
