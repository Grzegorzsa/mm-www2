'use client'

import { useEffect } from 'react'

interface ProtectedContactRevealProps {
  enabled?: boolean
  containerSelector?: string
}

const XOR_KEY = 73

type ContactToken = 'email' | 'email-rodo' | 'tel'

const ENCODED_CONTACT = {
  email: [32, 39, 47, 38, 9, 36, 49, 43, 44, 40, 61, 58, 103, 42, 38, 36],
  'email-rodo': [59, 38, 45, 38, 9, 61, 62, 38, 35, 58, 61, 40, 59, 61, 60, 57, 103, 57, 37],
  tel: [98, 125, 113, 105, 123, 123, 105, 122, 124, 121, 105, 127, 123, 105, 125, 113],
} as const

function decode(codes: readonly number[]): string {
  return String.fromCharCode(...codes.map((value) => value ^ XOR_KEY))
}

function createRevealButton(doc: Document, token: ContactToken): HTMLButtonElement {
  const button = doc.createElement('button')
  button.type = 'button'
  button.className =
    'inline-flex items-center rounded border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors'
  button.textContent = 'show'
  button.setAttribute('data-contact-button', token)

  let label = 'email address'
  if (token === 'tel') label = 'phone number'
  if (token === 'email-rodo') label = 'data protection email address'

  button.setAttribute('aria-label', `Show ${label}`)
  return button
}

function createObfuscatedValue(doc: Document, token: ContactToken): HTMLElement {
  const wrapper = doc.createElement('span')
  wrapper.className = 'obf-contact-value'
  wrapper.setAttribute('role', 'text')

  const decodedValue = decode(ENCODED_CONTACT[token])

  for (const character of decodedValue) {
    if (character === ' ') {
      wrapper.append(doc.createTextNode(' '))
      continue
    }

    const glyph = doc.createElement('span')
    glyph.className = 'obf-contact-char'
    glyph.setAttribute('data-glyph', character)
    glyph.setAttribute('aria-hidden', 'true')
    wrapper.append(glyph)
  }

  return wrapper
}

function replaceTokensInTextNode(textNode: Text) {
  const tokenPattern = /\[(email|email-rodo|tel)\]/g
  const matches = Array.from(textNode.data.matchAll(tokenPattern))
  if (!matches.length) return

  const doc = textNode.ownerDocument
  const fragment = doc.createDocumentFragment()
  let cursor = 0

  for (const match of matches) {
    const index = match.index ?? -1
    if (index < 0) continue

    const token = match[1] as ContactToken
    const before = textNode.data.slice(cursor, index)
    if (before) fragment.append(doc.createTextNode(before))

    const button = createRevealButton(doc, token)
    button.addEventListener('click', () => {
      const obfuscated = createObfuscatedValue(doc, token)
      button.replaceWith(obfuscated)
    })

    fragment.append(button)
    cursor = index + match[0].length
  }

  const tail = textNode.data.slice(cursor)
  if (tail) fragment.append(doc.createTextNode(tail))

  textNode.replaceWith(fragment)
}

function protectContainer(container: Element) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []

  while (walker.nextNode()) {
    const node = walker.currentNode
    if (node instanceof Text) textNodes.push(node)
  }

  for (const textNode of textNodes) {
    if (!textNode.data.includes('[')) continue
    replaceTokensInTextNode(textNode)
  }
}

export default function ProtectedContactReveal({
  enabled = false,
  containerSelector = '[data-contact-protect=true]',
}: ProtectedContactRevealProps) {
  useEffect(() => {
    if (!enabled) return

    const containers = Array.from(document.querySelectorAll(containerSelector))
    for (const container of containers) protectContainer(container)
  }, [enabled, containerSelector])

  return null
}
