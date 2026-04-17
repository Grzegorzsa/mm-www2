'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, User } from 'lucide-react'
import Logo from './Logo'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/manual', label: 'Manual' },
  { href: '/downloads', label: 'Downloads' },
  { href: '/contact', label: 'Contact' },
]

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.collection === 'users') setLoggedIn(true)
      })
      .catch(() => {})
  }, [])

  return (
    <header className="fixed top-0 w-full z-50 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-widest uppercase hover:text-gray-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4">
          {loggedIn ? (
            <Link
              href="/panel/purchases"
              className="flex items-center gap-2 text-sm tracking-widest uppercase hover:text-gray-300 transition-colors"
            >
              <User size={15} />
              User Panel
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm tracking-widest uppercase hover:text-gray-300 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="text-sm tracking-widest uppercase border border-white px-4 py-1.5 hover:bg-white hover:text-black transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden bg-black border-t border-gray-800 px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 text-sm tracking-widest uppercase border-b border-gray-800 hover:text-gray-300"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-4 mt-4">
            {loggedIn ? (
              <Link
                href="/panel/purchases"
                className="flex items-center gap-2 text-sm tracking-widest uppercase hover:text-gray-300"
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} />
                User Panel
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm tracking-widest uppercase hover:text-gray-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm tracking-widest uppercase border border-white px-4 py-1.5 hover:bg-white hover:text-black transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header
