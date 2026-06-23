export {}

declare global {
  interface Window {
    createLemonSqueezy?: () => void
    LemonSqueezy?: {
      Url?: {
        Open?: (url: string) => void
      }
      Setup?: {
        CHANNELS?: {
          on?: (eventName: string, callback: (...args: unknown[]) => void) => void
        }
      }
    }
  }
}
