import { describe, expect, it } from 'vitest'
import { DEFAULT_PANEL_PATH, getSafePanelReturnTo } from '@/lib/panelRedirect'

describe('getSafePanelReturnTo', () => {
  it('preserves panel paths and query parameters', () => {
    expect(getSafePanelReturnTo('/user-panel/report-bug?source=desktop')).toBe(
      '/user-panel/report-bug?source=desktop',
    )
  })

  it.each([
    'https://example.com/user-panel/report-bug',
    '//example.com/user-panel/report-bug',
    '/user-panel\\example.com',
    '/account',
    '',
  ])('uses the default panel page for an unsafe destination: %s', (destination) => {
    expect(getSafePanelReturnTo(destination)).toBe(DEFAULT_PANEL_PATH)
  })
})
