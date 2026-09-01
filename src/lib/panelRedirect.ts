export const DEFAULT_PANEL_PATH = '/user-panel/purchases'

export function getSafePanelReturnTo(value: string | null | undefined): string {
  if (!value || value.includes('\\') || /[\r\n]/.test(value)) return DEFAULT_PANEL_PATH

  try {
    const baseUrl = 'https://panel.local'
    const url = new URL(value, baseUrl)
    const isPanelPath = url.pathname === '/user-panel' || url.pathname.startsWith('/user-panel/')

    if (url.origin !== baseUrl || !isPanelPath) return DEFAULT_PANEL_PATH

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return DEFAULT_PANEL_PATH
  }
}
