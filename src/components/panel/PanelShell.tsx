'use client'

import { useState } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'

export default function PanelShell({
  userEmail,
  children,
}: {
  userEmail: string
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Topbar
        userEmail={userEmail}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar drawer */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-56 flex flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:hidden',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="h-14 border-b border-gray-200 flex items-center px-4 text-sm font-semibold text-gray-700">
            Menu
          </div>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-6 py-8 sm:px-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
