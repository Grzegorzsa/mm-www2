'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@payloadcms/ui'

export function LogoutButton() {
  const { logOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logOut()
    router.push('/admin/login')
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: 'calc(var(--base) * 0.5) var(--base)',
        background: 'none',
        border: 'none',
        borderTop: '1px solid var(--theme-elevation-100)',
        color: 'var(--theme-elevation-650)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        textAlign: 'left',
        marginTop: 'auto',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-text)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-elevation-650)'
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Logout
    </button>
  )
}
