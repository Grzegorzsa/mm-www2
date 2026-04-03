import React from 'react'
import '../globals.css'
import Header from '@/components/frontend/Header'
import Footer from '@/components/frontend/Footer'

export const metadata = {
  description: 'MXbeats — cutting-edge music looping software',
  title: 'MXbeats',
}

export default async function FrontendLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
