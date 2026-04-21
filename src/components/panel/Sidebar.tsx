'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Monitor, Download, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/user-panel/purchases', label: 'Purchases', icon: ShoppingBag },
  { href: '/user-panel/installations', label: 'Installations', icon: Monitor },
  { href: '/user-panel/downloads', label: 'Downloads', icon: Download },
  { href: '/user-panel/account', label: 'My Account', icon: User },
]

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
