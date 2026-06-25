'use client'

export function ActivationCodesToolsLink() {
  return (
    <a
      href="/admin/tools/activation-codes"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: 'calc(var(--base) * 0.5) var(--base)',
        color: 'var(--theme-elevation-650)',
        textDecoration: 'none',
        fontSize: '0.875rem',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--theme-text)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--theme-elevation-650)'
      }}
    >
      Activation Codes Tool
    </a>
  )
}
