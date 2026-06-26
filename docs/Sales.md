# Sales Operations Guide

This document explains how to use and maintain the current sales flow implementation:

- Pricing CTA flow on homepage (Register / Buy with legal consent)
- Commerce offer policy engine for new purchases and upgrades
- User panel upgrade offers
- Post-registration and post-purchase email templates
- Audit model: Orders + License Transactions + Licenses
- Admin debug endpoint for order trace by external order id
- Temporary email domain blocking for registration and webhook
- Activation codes (single-use) with public and authenticated redeem paths

Use this file as the source of truth for support and operations.

## Activation Codes (Single-Use)

Purpose:

- Activation codes are one-time keys used to grant a license without Lemon checkout.
- They support two redemption paths:
  - Public redeem (new customer creates account while redeeming)
  - User panel redeem (existing authenticated user)

Rules:

- A code can be redeemed only once.
- Expired or inactive codes are rejected.
- Redeem creates a license with the version and installation limits configured on the code.
- Optional `validDays` sets license `validTill` from the redeem date (for example 14-day trials).
- Optional `trial` prevents redeem if user already redeemed any previous trial code for the same product + variant.
- If `assignSellerAsLifetime` is enabled and the code is redeemed in public flow, seller is assigned as lifetime affiliate only for the newly created user account.

Operational endpoints:

- Public preview: `POST /api/redeem/preview`
- Public redeem: `POST /api/redeem/public`
- Authenticated redeem: `POST /api/redeem/user`
- Admin generate: `POST /api/admin/activation-codes/generate`
- Admin report: `GET /api/admin/activation-codes/report`

Implementation references:

- Collection: src/collections/ActivationCodes.ts
- Helper: src/lib/activationCodes.ts
- Public page: src/app/(frontend)/(auth)/redeem/page.tsx
- Panel page: src/app/(user-panel)/user-panel/redeem/page.tsx
- Panel navigation: src/components/panel/Sidebar.tsx

## 1. Checkout Flow on Homepage

Main behavior:

- Elements: shows Register button and routes to sign-up
- Loops and Beats: show dynamic CTA based on effective ownership and available offers
  - Owned: show `Owned`
  - Offer available: show `Upgrade`/`Crossgrade` + offer price
  - No ownership/offer: show `Buy`
- Effective ownership is computed from Product Variant hierarchy levels (`product-variants.hierarchy`)
  - Example baseline: Elements=1, Player=2, Loops=3, Beats=4, Composer=5
  - Owning a higher hierarchy variant implies effective ownership of lower hierarchy variants
  - Offer visibility is filtered to prevent showing upgrades/crossgrades to a variant at or below current max owned hierarchy
- Buy opens a modal with required legal consent (Terms + Refund Policy)
- Checkout is created through a dedicated API route that locks Lemon checkout to one selected variant
- Affiliate code from URL is propagated to Lemon checkout as custom field
- Checkout navigation is same-tab (no new tab)
- Lemon checkout includes post-payment redirect to `/checkout-success`

Discount codes:

- Supported code types:
  - percentage discount, e.g. `10` for 10%
  - fixed amount, stored in cents, e.g. `1000` for 10 USD
- Each code can be active/inactive, date-bound, and limited by max uses.
- Default minimum subtotal after discount is 1000 cents (10 USD).
- Discount codes can also attach an affiliate partner to the order.
- If `affiliateLifetime` is enabled, the affiliate is copied to the user profile only for first-time customers.
- Direct-purchase variants need `priceCents` configured so percentage/fixed discounts can be validated before redirecting to Lemon.

Implementation references:

- Frontend pricing actions: src/components/frontend/PricingActions.tsx
- Homepage integration: src/app/(frontend)/HomePage.tsx
- Discount code schema/helper: src/collections/DiscountCodes.ts, src/lib/discountCodes.ts
- Ownership hierarchy helper: src/lib/variantOwnership.ts

Environment:

- Required: LEMON_SQUEEZY_API_KEY, LEMON_SQUEEZY_STORE_ID
- Variant IDs must be configured on Product Variants in CMS for homepage products

Validation checklist:

1. Open homepage pricing section.
2. Verify Elements shows Register and routes to /sign-up.
3. Verify Buy for Loops/Beats opens modal.
4. Verify checkout button is disabled until legal checkbox is accepted.
5. Test URL with affiliate_code and confirm it appears in checkout custom data.
6. Confirm checkout opens with only the selected variant enabled (no variant list).
7. Confirm successful payment redirects to `/checkout-success?source=lemon&flow=...`.
8. Confirm logged-in user with Composer sees `Owned` for Loops and Beats.
9. Confirm a valid discount code reduces checkout price and persists on the order.
10. Confirm a discount code with affiliate settings attaches the affiliate to the order and only creates lifetime referral for first-time customers.

## 2. Commerce Offers (Policy Engine)

Commerce offers define how Lemon variant purchases are translated into licensing actions.

Collection:

- src/collections/CommerceOffers.ts

Key fields:

- lemonSqueezyVariantId: incoming variant id from webhook (required for all types except upgrade_replace and trial)
- actionType: new_purchase | upgrade_replace | crossgrade | renewal | trial
- product + targetVariant: what entitlement should be created
- versionFrom + versionTo: explicit major version range
- validDays: required for trial, specifies trial license duration in days
- allowedFromVariants: optional upgrade whitelist (upgrade_replace only)
- denyFromVariants: optional upgrade blacklist (upgrade_replace only)
- allowedFromProducts: required for crossgrade — list of source products the user must own

Critical version rule:

- Always set explicit versionTo.
- Do not use implicit infinite range behavior.
- versionFrom/versionTo map to major version boundaries from product versionNo.

Suggested setup examples:

1. New purchase offer:
   - actionType: new_purchase
   - allowedFromVariants and denyFromVariants: empty
2. Upgrade offer:
   - actionType: upgrade_replace
   - set allowedFromVariants to explicitly allowed source variants
   - use denyFromVariants to block discount paths (for example Elements)
3. Crossgrade offer:
   - actionType: crossgrade
   - set allowedFromProducts to the source product(s) whose owners can crossgrade
   - targetVariant must point to a variant of the destination product
   - lemonSqueezyVariantId is required (use the Lemon Squeezy variant ID, not the product/app ID)
   - user_id must be present in checkout custom_data (hard reject if missing)
4. Trial offer:
   - actionType: trial
   - validDays is required and must be > 0 (e.g. 14 for a 14-day trial)
   - lemonSqueezyVariantId is NOT required
   - targetVariant must point to the trial variant
   - lemonSqueezyVariantId is NOT used; checkout bypasses Lemon

Note: Products without variants must still have at least one ProductVariant record (e.g. named "Standard"). This is required for license provisioning.

## 2.1 Trial Offers

Trial offers enable time-limited free access to a product variant for users who own an active license.

Key fields:

- actionType: trial
- validDays: number of days the trial license is valid (required, must be > 0)
- targetVariant: the variant to trial
- lemonSqueezyVariantId: NOT required for trial (checkout bypasses Lemon)

Behavior:

- Checkout does not redirect to Lemon Squeezy; instead, license is created directly in the backend
- License is created with `validTill` set to `now + validDays`
- Duplicate prevention: user cannot activate a trial for the same product + variant twice (blocks both active and expired trials)
- Response is `{ trial: true, targetVariantId }` instead of `{ checkoutUrl }`
- Button text in UI: "Start Free Trial"
- Trial duration is displayed in days

## 2.2 License Status Display

License status in the user panel is determined by the following priority:

1. If `validTill` is in the past → status is "Expired" (amber color, warning)
2. If `active: true` → status is "Active" (green color)
3. If `active: false` → status is "Inactive" (red color)

This ensures expired trial licenses are clearly marked with expiration status even if the active flag is still true.

Implementation:

- src/components/panel/LicenseCard.tsx

## 3. User Panel Upgrade & Crossgrade & Trial Offers

User panel now computes available offers from active licenses and active upgrade_replace/crossgrade/trial offers.

Implementation:

- src/app/(user-panel)/user-panel/offers/Offers.tsx

Eligibility logic summary:

- Uses only active user licenses
- Reads active commerce offers where actionType is upgrade_replace, crossgrade, or trial
- For upgrade_replace: matches source variants against allowedFromVariants/denyFromVariants
- For crossgrade: requires allowedFromProducts + applies allowedFromVariants/denyFromVariants + commercial/non-commercial match
- For trial: checks validDays requirement and prevents duplicate trials per product+variant
- Excludes offers where target variant is already owned (except trial, which has its own duplicate check)

Dev troubleshooting:

- In non-production environments, panel shows an expandable "Dev debug: offer eligibility" section explaining why each offer was accepted/rejected.

Operational notes:

- If no checkout base URL or target variant id is configured, user sees a configuration warning.
- For crossgrade, checkout uses offer.referencePriceCents as custom checkout price when provided.
- For trial, button text is "Start Free Trial" and no Lemon checkout occurs.
- For trial, if user already has an active or expired trial for the product+variant, offer is hidden with debug reason.
- Upgrade/Crossgrade/Trial checkout from panel uses same-tab navigation.

## 4. Email Templates

### 4.1 Register Welcome Email

Global:

- src/globals/RegisterWelcomeEmail.ts

Defaults source:

- src/globals/registerWelcomeEmailContent.ts

Purpose:

- Sent after user verification and welcome license assignment.

### 4.2 Purchase Welcome Email

Global:

- src/globals/PurchaseWelcomeEmail.ts

Defaults source:

- src/globals/purchaseWelcomeEmailContent.ts

Purpose:

- Sent after successful purchase processing.

Supported variables:

- {{applicationName}}
- {{variantName}}
- {{loginEmail}}
- {{loginPassword}}
- {{externalOrderId}}
- {{downloadsUrl}}
- {{userPanelUrl}}
- {{signInUrl}}
- {{accountSecurityNotice}}

Implementation:

- Mail rendering/sending: src/lib/licenseHelper.ts

Operational note:

- If purchase-welcome-email global is missing or empty, mail sending is safely skipped with warning.

## 5. Data Model and Traceability

Current model responsibilities:

- Orders: billing-facing order record and single source of truth for order identifiers
- Orders: billing-facing order record, single source of truth for order identifiers, and discount code usage metadata
- License Transactions: immutable licensing audit operation with discount code metadata (no order identifiers — use order relation)
- Licenses: final entitlement state

Collections:

- src/collections/Orders.ts
- src/collections/LicenseTransactions.ts
- src/collections/Licenses.ts

Order identifiers (stored only in Orders):

- externalOrderId: Lemon order_number (human-readable, e.g. 36010719) — used for idempotency and support lookup
- lemonOrderId: Lemon API resource id (e.g. 8783336) — used as fallback idempotency key

Traceability links:

- Order -> licenseTransaction (direct relation)
- LicenseTransaction -> order (relation on transaction — access order identifiers via this)
- License -> order
- LicenseTransaction -> fromLicense/toLicense and fromVariant/toVariant

Webhook flow:

- src/app/api/webhooks/lemon/route.ts

Behavior summary:

1. Idempotency check by externalOrderId (order_number) OR lemonOrderId (API id) in Orders collection.
2. User resolved by user_id from custom_data first, then email fallback.
3. Offer resolution from commerce-offers by variant ID or explicit offer ID.
4. For upgrade_replace: source license found by allowedFromVariants/denyFromVariants, then deactivated.
5. For crossgrade: source license found by allowedFromProducts + allowedFromVariants/denyFromVariants (+ commercial flag match); source license remains active.
6. Transaction created as pending.
7. Order created and linked to transaction, including any applied discount metadata.
8. License created with correct version range.
9. Transaction updated to completed or failed.

## 6. Admin Debug Endpoint

Endpoint:

- GET /api/admin/debug/order-trace?externalOrderId=...

Implementation:

- src/app/api/admin/debug/order-trace/route.ts

Access:

- Admin users only (collection must be admin-users)

Response includes:

- summary
- selected order
- linked/fallback transaction
- licenses linked by order

Status codes:

- 400: missing query param
- 401: unauthorized
- 404: order not found
- 200: trace payload

Support usage:

1. Ask customer for external order id.
2. Open endpoint while authenticated as admin.
3. Verify order, transaction status, and generated licenses.
4. If mismatch exists, inspect info/errorMessage in license-transactions and webhook logs.

## 7. Ongoing Update Procedure

When you change sales behavior, update this document in the same PR.

Always update these sections if applicable:

1. Checkout behavior and required env vars
2. Offer policy fields/rules
3. Upgrade eligibility logic
4. Email variables and template behavior
5. Data model relationships
6. Debug/support endpoints
7. Temporary email domain policy

Required validation after sales-related changes:

1. pnpm payload generate:types (when schema changed)
2. pnpm tsc --noEmit
3. End-to-end smoke test for:
   - new purchase
   - upgrade path
   - crossgrade path
   - trial path (if applicable)
   - post-purchase email
   - user panel offer visibility

## 8. Change Log (Keep Updated)

Add one short entry for each sales change.

Template:

- Date: YYYY-MM-DD
- Scope: checkout | offer-policy | webhook | emails | user-panel | support-tools
- Change: one sentence
- Files: list key files
- Validation: types, manual test, automated test

Current entries:

- Date: 2026-06-25
- Scope: discount-codes, checkout, webhook
- Change: Added discount code workflow with percentage/fixed-amount discounts, min subtotal guard, active/date/usage limits, and optional affiliate/lifetime attribution.
- Files: src/collections/DiscountCodes.ts, src/lib/discountCodes.ts, src/app/api/checkout/purchase/route.ts, src/app/api/checkout/upgrade/route.ts, src/app/api/webhooks/lemon/route.ts, src/collections/Orders.ts, src/collections/LicenseTransactions.ts, src/collections/ProductVariants.ts
- Validation: pnpm generate:types; pnpm tsc --noEmit

- Date: 2026-06-25
- Scope: checkout, homepage, user-panel
- Change: Added Lemon post-payment redirect (`redirect_url`) to `/checkout-success` with `source=lemon`, receipt button URL/text, and same-tab checkout navigation on homepage and in user-panel offers.
- Files: src/app/api/checkout/purchase/route.ts, src/app/api/checkout/upgrade/route.ts, src/app/(frontend)/checkout-success/page.tsx, src/components/frontend/PricingActions.tsx, src/components/panel/UpgradeButton.tsx
- Validation: pnpm tsc --noEmit

- Date: 2026-06-25
- Scope: homepage, offer-policy
- Change: Restored dynamic homepage CTA logic (`Owned`/`Upgrade`/`Crossgrade`/`Buy`) and added tier inheritance for effective ownership (`Composer => Beats + Loops`, `Beats => Loops`).
- Files: src/app/(frontend)/HomePage.tsx, src/components/frontend/PricingActions.tsx, src/lib/variantOwnership.ts
- Validation: pnpm tsc --noEmit

- Date: 2026-06-25
- Scope: checkout, security
- Change: Added canonical blocked-email matching by removing dots from local-part to prevent alias bypass (`first.last@...` equals `firstlast@...`) with compatibility for legacy stored records.
- Files: src/lib/bannedDomains.ts, src/collections/BannedEmails.ts
- Validation: pnpm tsc --noEmit

- Date: 2026-06-23
- Scope: webhook, checkout
- Change: Added banned temporary email domain validation in registration flow and Lemon webhook.
- Files: src/collections/BannedDomains.ts, src/lib/bannedDomains.ts, src/app/api/auth/register/route.ts, src/app/api/auth/check-email-domain/route.ts, src/app/api/webhooks/lemon/route.ts, src/app/(frontend)/(auth)/sign-up/SignUpForm.tsx
- Validation: pnpm payload generate:types, pnpm tsc --noEmit

- Date: 2026-06-23
- Scope: support-tools
- Change: Added admin order trace endpoint returning order + license transaction + licenses by order.
- Files: src/app/api/admin/debug/order-trace/route.ts
- Validation: pnpm tsc --noEmit

- Date: 2026-06-24
- Scope: offer-policy, webhook, data-model
- Change: Added crossgrade offer type. Source products whitelist (allowedFromProducts) on CommerceOffers. crossgrade transaction type added to Orders and LicenseTransactions. Webhook handles source license deactivation across products.
- Files: src/collections/CommerceOffers.ts, src/collections/Orders.ts, src/collections/LicenseTransactions.ts, src/app/api/webhooks/lemon/route.ts
- Validation: pnpm payload generate:types, pnpm tsc --noEmit

- Date: 2026-06-24
- Scope: data-model
- Change: Eliminated order identifier duplication. externalOrderId and lemonOrderId now stored only in Orders. LicenseTransactions references Orders via relation only. externalOrderId (order_number) is idempotency key; lemonOrderId (API id) is fallback.
- Files: src/collections/Orders.ts, src/collections/LicenseTransactions.ts, src/app/api/webhooks/lemon/route.ts, src/app/api/admin/debug/order-trace/route.ts
- Validation: pnpm payload generate:types, pnpm tsc --noEmit

- Date: 2026-06-24
- Scope: user-panel, checkout, webhook, offer-policy
- Change: Crossgrade now honors variant allow/deny filters, uses explicit ProductVariant.isCommercial flag (with fallback), uses offer.referencePriceCents in checkout when provided, and no longer deactivates source license. Added dev-only eligibility debug panel.
- Files: src/collections/ProductVariants.ts, src/app/(user-panel)/user-panel/purchases/Purchases.tsx, src/components/panel/UpgradeButton.tsx, src/app/api/checkout/upgrade/route.ts, src/app/api/webhooks/lemon/route.ts
- Validation: pnpm payload generate:types, pnpm tsc --noEmit

- Date: 2026-06-24
- Scope: checkout, homepage
- Change: Homepage buy buttons now create Lemon checkouts through a dedicated API route and force a single selected variant, preventing the variant list from appearing and ensuring the intended product is preselected.
- Files: src/app/api/checkout/purchase/route.ts, src/components/frontend/PricingActions.tsx, src/app/(frontend)/HomePage.tsx
- Validation: pnpm tsc --noEmit

- Date: 2026-06-26
- Scope: offer-policy, checkout, user-panel, debug
- Change: Added trial actionType to commerce offers. Trial offers skip Lemon checkout and create licenses directly with validDays expiration. Prevents duplicate trials per product+variant. Added dev-only eligibility debug panel in offers section. Fixed LicenseCard to show "Expired" status when validTill has passed.
- Files: src/collections/CommerceOffers.ts, src/lib/offersHelper.ts, src/app/api/checkout/upgrade/route.ts, src/app/(user-panel)/user-panel/offers/Offers.tsx, src/app/(user-panel)/user-panel/offers/OffersDebug.tsx, src/components/panel/UpgradeButton.tsx, src/components/panel/LicenseCard.tsx, src/lib/licenseHelper.ts
- Validation: pnpm payload generate:types; pnpm tsc --noEmit

## 9. Temporary Email Domain Policy

Collection:

- src/collections/BannedDomains.ts

Helpers:

- src/lib/bannedDomains.ts

Blocked email canonicalization:

- Local-part (before `@`) is normalized by removing dots before storing and comparing.
- Example: `first.last@gmail.com` and `fi.rstlast@gmail.com` are treated as the same canonical address.
- Canonical matching is used in banned-email checks to prevent alias-based bypass.

Validation points:

- Registration API: src/app/api/auth/register/route.ts
- Frontend pre-check endpoint: src/app/api/auth/check-email-domain/route.ts
- Sign-up form pre-validation: src/app/(frontend)/(auth)/sign-up/SignUpForm.tsx
- Lemon webhook: src/app/api/webhooks/lemon/route.ts

Rejected message:

- Temporary email addresses are not allowed

How to update blocked domains:

1. Add or remove entries in Payload Admin -> Banned Domains.
2. Keep domains lowercase (normalization is automatic).
3. If you want to bootstrap default domains in a fresh environment, run:
   - pnpm seed:banned-domains

Default seed list source:

- src/lib/bannedDomains.ts (DEFAULT_BANNED_DOMAINS)

- Date: 2026-06-23
- Scope: webhook, data-model
- Change: Added bidirectional traceability between orders and license-transactions.
- Files: src/collections/Orders.ts, src/app/api/webhooks/lemon/route.ts
- Validation: pnpm payload generate:types, pnpm tsc --noEmit

- Date: 2026-06-23
- Scope: offer-policy, user-panel, emails, checkout
- Change: Added commerce offer policy flow, user upgrade offers, purchase email global, and pricing modal checkout behavior.
- Files: src/collections/CommerceOffers.ts, src/collections/LicenseTransactions.ts, src/app/(user-panel)/user-panel/purchases/Purchases.tsx, src/globals/PurchaseWelcomeEmail.ts, src/components/frontend/PricingActions.tsx
- Validation: pnpm payload generate:types, pnpm tsc --noEmit
