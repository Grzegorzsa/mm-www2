/**
 * Simple form-parity checksum (djb2-variant seeded with the current year).
 *
 * Used as a first-line defense against automated bots that blindly POST to API
 * endpoints without going through the actual form in a browser. Any request
 * arriving without a valid `scs` field (or with a wrong value) is rejected as
 * 401 Unauthorized before any real processing takes place.
 *
 * Limitations (by design — this is a lightweight hurdle, not a full CAPTCHA):
 *  - The function is bundled in client-side JS, so a determined attacker who
 *    reads the bundle can replicate it. For stronger protection consider adding
 *    Cloudflare Turnstile or hCaptcha.
 *  - The hash rotates every year (year is the initial seed), so pre-computed
 *    values expire at most annually.
 *
 * Usage:
 *   Client: scs = h(email)          → include in fetch body
 *   Server: if (scs !== h(email)) → reject 401
 */
export function h(str: string): string {
  let a = new Date().getFullYear()
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    a = (a << 5) - a + char
    a |= 0 // keep as 32-bit integer
  }
  return Math.abs(a).toString(16)
}
