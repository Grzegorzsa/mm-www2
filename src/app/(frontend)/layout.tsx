import React from 'react'
import '../globals.css'
import { DM_Sans } from 'next/font/google'
import Header from '@/components/frontend/Header'
import Footer from '@/components/frontend/Footer'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export default async function FrontendLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={dmSans.variable} data-scroll-behavior="smooth">
      <body className="bg-black text-white min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
