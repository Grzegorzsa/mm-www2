'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import Logo from '@/components/frontend/Logo'

export default function Topbar({
  userEmail,
  onMenuToggle,
  sidebarOpen,
}: {
  userEmail: string
  onMenuToggle: () => void
  sidebarOpen: boolean
}) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header className="h-14 bg-black text-white flex items-center justify-between px-4 shrink-0">
      {/* Left: hamburger (mobile) + logo */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-1.5 rounded-md text-gray-400 hover:bg-gray-800"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Logo />
      </div>

      {/* Right: user dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-gray-300">
            <User size={15} />
          </span>
          <span className="hidden sm:block max-w-[160px] truncate text-gray-200">{userEmail}</span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-md z-50 py-1">
            <Link
              href="/user-panel/account"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User size={15} className="text-gray-400" />
              My Account
            </Link>
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
