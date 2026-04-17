'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { h } from '@/lib/h'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ContactForm() {
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [sent, setSent] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!isValidEmail(email)) e.email = 'A valid email address is required'
    if (!subject.trim()) e.subject = 'Subject is required'
    if (!message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setIsLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message, scs: h(message + email + subject) }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'An error occurred, please try again later')
      }
      setSent(true)
    } catch (err: any) {
      setServerError(err?.message ?? 'An error occurred, please try again later')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-6 text-green-800 text-center">
        <p className="text-lg font-semibold mb-1">Message sent!</p>
        <p>Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 text-gray-800">
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
            errors.email ? 'border-red-400' : 'border-gray-300'
          }`}
          autoComplete="email"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
            errors.subject ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          value={message}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-vertical ${
            errors.message ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
