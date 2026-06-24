'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Monitor, Download, User, BadgePercent } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/user-panel/purchases', label: 'Purchases', icon: ShoppingBag },
  { href: '/user-panel/offers', label: 'Offers', icon: BadgePercent },
  { href: '/user-panel/installations', label: 'Installations', icon: Monitor },
  { href: '/user-panel/downloads', label: 'Downloads', icon: Download },
  { href: '/user-panel/account', label: 'My Account', icon: User },
]

export default function Sidebar({
  onNavigate,
  offersCount = 0,
}: {
  onNavigate?: () => void
  offersCount?: number
}) {
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
            {href === '/user-panel/offers' && offersCount > 0 ? (
              <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {offersCount}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
