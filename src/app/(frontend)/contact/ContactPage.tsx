import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us — MXbeats',
  description: 'Get in touch with the MXbeats team',
}

export default function ContactPage() {
  return (
    <div className="bg-[#f3f3f3] min-h-[calc(100vh-320px)] flex items-center justify-center py-8">
      <div className="max-w-2xl w-full mx-auto bg-white px-6 pt-6 pb-8 text-[#444]">
        <h1 className="text-3xl font-bold tracking-widest mb-6">Contact Us</h1>
        <ContactForm />
      </div>
    </div>
  )
}
