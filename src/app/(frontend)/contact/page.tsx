import type { Metadata } from 'next'
import ContactForm from './ContactForm'
import ClientOnly from '@/components/ClientOnly'

export const metadata: Metadata = {
  title: 'Contact Us — MXbeats',
  description: 'Get in touch with the MXbeats team',
}

export default function ContactPage() {
  return (
    <div className="bg-white min-h-[calc(100vh-320px)]">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold tracked-wide">Contact Us</h1>
        </div>
      </div>

      {/* Contact form section */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <ClientOnly>
          <ContactForm />
        </ClientOnly>
      </div>
    </div>
  )
}
