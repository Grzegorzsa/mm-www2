import { describe, expect, it } from 'vitest'
import { DEFAULT_PANEL_PATH, getSafePanelReturnTo } from '@/lib/panelRedirect'

describe('getSafePanelReturnTo', () => {
  it('preserves panel paths and query parameters', () => {
    const destination =
      '/user-panel/report-bug?os=Windows%2011%20ver%201.2.3&app=MXGRID%20ver%201.2.3'

    expect(getSafePanelReturnTo(destination)).toBe(destination)
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
