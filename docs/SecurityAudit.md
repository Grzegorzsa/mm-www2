# Security Audit - MXbeats Sales Platform

Date: 2026-07-10

Scope: Payload CMS access control, public API routes, checkout and webhook flows, license and installation logic, upload handling, secrets/configuration, and production dependency audit.

## Executive Summary

The platform has a solid baseline: admin/user separation is clear, owner-based read access is used for user-owned records, Lemon Squeezy webhooks verify HMAC signatures, session cookies are HTTP-only, and several sensitive public routes already have rate limiting.

The main security risk is that the generated Payload REST and GraphQL APIs are publicly exposed while several collections allow anonymous `create`. This can bypass custom API route validation, rate limiting, and business checks. The highest-priority fixes are access-control hardening, activation-code protection, stronger token generation, upload restrictions, and removal/protection of test routes.

## Priority Legend

- P0: Fix before production deployment or high-traffic launch.
- P1: Fix soon; meaningful security improvement with moderate effort.
- P2: Hardening and operational improvements.

## P0 Findings

### P0-01: Payload REST/GraphQL can bypass custom endpoint validation

Affected files:

- `src/app/(payload)/api/[...slug]/route.ts`
- `src/app/(payload)/api/graphql/route.ts`
- `src/collections/Orders.ts`
- `src/collections/LicenseTransactions.ts`
- `src/collections/ContactSubmissions.ts`
- `src/collections/Users.ts`

Issue:

Payload REST and GraphQL routes are exposed, and several collections allow public `create: () => true`. This means external clients can create documents directly through Payload APIs instead of going through custom API routes that perform validation, rate limiting, banned-domain checks, webhook signature checks, or business rules.

Impact:

- Fake or spam contact submissions.
- Direct user creation bypassing custom registration checks.
- Fake order and license transaction records if collection endpoints are reachable.
- Audit-log pollution and business-data integrity issues.

Recommended fix:

- Change public collection `create` access to a trusted-server-only pattern.
- Prefer `create: isAdmin` for `orders` and `license-transactions`.
- Let only signed webhook/custom route code create those records with `overrideAccess: true` after validation.
- For public contact and registration flows, route all writes through custom API endpoints and make direct collection creation unavailable or guarded by a server-only context flag.
- Consider disabling or restricting GraphQL if it is not required publicly.

### P0-02: Activation-code preview is public and not rate-limited

Affected file: `src/app/api/redeem/preview/route.ts`

Issue:

The endpoint accepts any activation code and returns whether it is valid, plus product/variant details and the activation code value itself. It has no authentication and no rate limiting.

Impact:

- Activation-code enumeration and brute force become easier.
- Attackers can discover valid codes and associated products.

Recommended fix:

- Add a dedicated rate limiter for preview attempts.
- Do not return the activation code value in the response.
- Return only minimal product metadata needed for UX.
- Consider requiring an authenticated session for preview, or merge preview into the redeem flow.

### P0-03: Activation codes use `Math.random()`

Affected file: `src/lib/activationCodes.ts`

Issue:

Activation codes are generated using `Math.random()`, which is not cryptographically secure.

Impact:

- Code generation has weaker entropy than expected for redeemable sales/licensing assets.
- Combined with the public preview endpoint, this increases practical brute-force risk.

Recommended fix:

- Replace `Math.random()` with Node crypto, for example `crypto.randomInt()` for each alphabet index or `crypto.randomBytes()` with rejection sampling.

### P0-04: Installation tokens use predictable entropy

Affected file: `src/lib/installationsHelper.ts`

Issue:

Installation tokens are generated from `Date.now()` plus `Math.random()` and hashed with SHA-1.

Impact:

- Token entropy is weaker than it should be for an authentication bearer token.
- Approximate timestamp knowledge can reduce the search space.

Recommended fix:

- Generate tokens with `crypto.randomBytes(32).toString('hex')`.
- Keep the uniqueness database check.

### P0-05: Sentry test endpoint is public

Affected file: `src/app/api/sentry-test/route.ts`

Issue:

The endpoint always throws an error and has no production guard or authentication.

Impact:

- Public users can trigger error events and noise monitoring.
- It exposes an unnecessary production attack surface.

Recommended fix:

- Return 404 in production.
- Or require an authenticated admin user.
- Remove the route after Sentry verification.

## P1 Findings

### P1-01: Installation certificate field lacks field-level read protection

Affected file: `src/collections/Installations.ts`

Issue:

Users can read their own installation records, and the `certificate` field does not have field-level `read` access. The `token` field is admin-only, but `certificate` is not.

Impact:

- A user can read raw base64 certificate data from their installation document through Payload APIs if the collection read path is exposed.

Recommended fix:

- Add field-level read access for `certificate`, likely admin-only.
- Continue returning certificates only through the token + machineId API flow.

### P1-02: Media uploads have no MIME type or size restrictions

Affected file: `src/collections/Media.ts`

Issue:

The Media collection uses `upload: true` without explicit MIME allowlist or max file size.

Impact:

- Malicious, oversized, or unexpected file types can be uploaded if an admin account is compromised or upload access changes later.
- Publicly served media becomes a larger attack surface.

Recommended fix:

- Configure allowed MIME types such as JPEG, PNG, WebP, AVIF, SVG only if SVG is truly needed.
- Set a practical `maxFileSize`.
- Consider extra SVG sanitization or disallow SVG if not required.

### P1-03: CMS HTML is rendered with `dangerouslySetInnerHTML`

Affected files:

- `src/app/(frontend)/manual/ManualPage.tsx`
- `src/app/(frontend)/manual/HtmlSection.tsx`
- `src/globals/pages/Manual.ts`

Issue:

Manual HTML from Payload CMS is rendered directly in the frontend.

Impact:

- If an admin account or CMS data is compromised, attackers can persist XSS into public manual pages.

Recommended fix:

- Sanitize HTML with an allowlist before rendering.
- Keep required tags for documentation, images, and videos, but strip scripts, event handlers, inline JavaScript URLs, and unsafe attributes.

### P1-04: Several public and authenticated endpoints lack rate limiting

Affected files:

- `src/app/api/auth/check-email-domain/route.ts`
- `src/app/api/checkout/purchase/route.ts`
- `src/app/api/checkout/upgrade/route.ts`
- `src/app/api/redeem/user/route.ts`
- `src/app/api/redeem/preview/route.ts`
- `src/app/api/app/installation/[machineId]/route.ts`
- `src/app/api/webhooks/lemon/route.ts`

Issue:

Some endpoints perform database lookups, checkout creation, activation-code checks, or token-based installation operations without endpoint-level rate limiting.

Impact:

- Brute force against activation codes or installation tokens.
- Checkout-session spam against Lemon Squeezy.
- Higher DoS risk on database-backed endpoints.

Recommended fix:

- Add dedicated limiters per endpoint and user/IP.
- For authenticated endpoints, combine user ID + IP where possible.
- For webhook endpoint, preserve signature verification and add basic IP/body-size/rate protection where feasible.

### P1-05: Auto-created purchase accounts are verified and receive a generated password by email

Affected files:

- `src/app/api/webhooks/lemon/route.ts`
- `src/lib/licenseHelper.ts`
- `src/globals/purchaseWelcomeEmailContent.ts`

Issue:

When a purchase webhook creates a new account, it sets `_verified: true`, disables verification email, generates a password, and sends that password through email.

Impact:

- Email becomes a credential delivery channel.
- Account verification semantics are weakened.

Recommended fix:

- Create accounts as unverified or partially provisioned.
- Send a one-time set-password link instead of a password.
- Keep licenses assigned, but require account confirmation before panel access.

## P2 Findings

### P2-01: In-memory rate limiter is not suitable for multi-instance deployment

Affected file: `src/lib/rateLimiter.ts`

Issue:

Rate-limit state is stored in process memory.

Impact:

- Works for a single Node process.
- Can be bypassed across multiple instances, restarts, serverless functions, or horizontally scaled containers.

Recommended fix:

- Replace with Redis/Upstash-backed rate limiting before scaling beyond one instance.

### P2-02: Direct dependency audit reports production vulnerabilities

Command run:

```bash
pnpm audit --prod
```

Result:

- Audit exited with code 1.
- Reported summary: 18 high, 50 moderate, 11 low.

Notable packages:

- `nodemailer`: high severity advisory; direct dependency and also used through `@payloadcms/email-nodemailer`.
- `undici`: multiple advisories through `payload`.
- `hono`, `dompurify`, `js-yaml`, `ws`: mostly transitive, with some paths through tooling such as `shadcn` / MCP SDK.

Recommended fix:

- Update `nodemailer` to a patched version supported by Payload email adapter.
- Update Payload packages and refresh the lockfile to pull patched transitive dependencies where available.
- Move CLI-only tooling such as `shadcn` to devDependencies or remove it from production dependencies if it is not needed at runtime.

### P2-03: Form parity hash is not CSRF protection

Affected file: `src/lib/h.ts`

Issue:

The `h()` checksum is intentionally a lightweight bot hurdle and is bundled client-side.

Impact:

- It can be reproduced by attackers and should not be treated as a security token.

Recommended fix:

- Keep it only as a light bot-friction layer.
- For stronger protection, add real CSRF token flow, Origin/Referer validation for browser POSTs, or Cloudflare Turnstile/hCaptcha on high-abuse forms.

### P2-04: Checkout URL uses environment/public origin fallback

Affected files:

- `src/app/api/checkout/purchase/route.ts`
- `src/app/api/checkout/upgrade/route.ts`

Issue:

Checkout redirect base URL is resolved from environment variables or `req.nextUrl.origin`.

Impact:

- Usually fine behind trusted hosting/proxy.
- If host headers are not controlled by infrastructure, fallback origin can be influenced.

Recommended fix:

- Require a fixed server-side canonical app URL in production.
- Avoid using request origin as production fallback.

## Positive Findings

- Lemon Squeezy webhook verifies HMAC-SHA256 signatures with timing-safe comparison.
- User-owned data uses owner checks in `isAdminOrOwner` for licenses, installations, and orders.
- Admin-only collections are consistently restricted to `admin-users`.
- Session lookup uses Payload `auth()` and rejects non-user collections for user panel session helpers.
- Login, register, forgot-password, reset-password, contact, and public redeem routes already have rate limiting.
- Login cookie is `httpOnly`, `secure` in production, and `sameSite: 'lax'`.
- `.env` is ignored by Git and was not shown as tracked.
- Security headers include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Discount code validation prevents zero-value checkout and enforces usage limits.

## Suggested Remediation Order

1. Lock down public collection `create` access and ensure Payload REST/GraphQL cannot bypass custom validation.
2. Fix activation-code preview and generation randomness.
3. Replace installation token generation with cryptographic randomness.
4. Protect or remove the Sentry test route.
5. Add field-level protection for installation certificates.
6. Add Media upload MIME and size restrictions.
7. Add rate limits to preview, checkout, user redeem, installation revalidation/delete, and email-domain check endpoints.
8. Sanitize manual HTML before rendering.
9. Change auto-created purchase-account flow to set-password links instead of emailed generated passwords.
10. Update vulnerable production dependencies and move CLI-only tooling out of production dependencies.

## Validation Performed

- Reviewed Payload collection access configs and field-level access.
- Reviewed generated Payload REST and GraphQL route exposure.
- Reviewed custom API route handlers under `src/app/api`.
- Reviewed checkout, webhook, activation-code, installation, session, license, and discount helper logic.
- Checked secrets patterns and confirmed `.env` is ignored and not tracked by Git.
- Ran production dependency audit with `pnpm audit --prod`.
