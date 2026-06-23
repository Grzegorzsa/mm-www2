# Sales Operations Guide

This document explains how to use and maintain the current sales flow implementation:

- Pricing CTA flow on homepage (Register / Buy with legal consent)
- Commerce offer policy engine for new purchases and upgrades
- User panel upgrade offers
- Post-registration and post-purchase email templates
- Audit model: Orders + License Transactions + Licenses
- Admin debug endpoint for order trace by external order id
- Temporary email domain blocking for registration and webhook

Use this file as the source of truth for support and operations.

## 1. Checkout Flow on Homepage

Main behavior:

- Elements: shows Register button and routes to sign-up
- Loops and Beats: show Buy buttons
- Buy opens a modal with required legal consent (Terms + Refund Policy)
- Checkout URL is built from environment config
- Affiliate code from URL is propagated to Lemon checkout as custom field

Implementation references:

- Frontend pricing actions: src/components/frontend/PricingActions.tsx
- Homepage integration: src/app/(frontend)/HomePage.tsx

Environment:

- Required: NEXT_PUBLIC_LEMON_CHECKOUT_BASE_URL

Validation checklist:

1. Open homepage pricing section.
2. Verify Elements shows Register and routes to /sign-up.
3. Verify Buy for Loops/Beats opens modal.
4. Verify checkout button is disabled until legal checkbox is accepted.
5. Test URL with affiliate_code and confirm it appears in checkout custom data.

## 2. Commerce Offers (Policy Engine)

Commerce offers define how Lemon variant purchases are translated into licensing actions.

Collection:

- src/collections/CommerceOffers.ts

Key fields:

- lemonSqueezyVariantId: incoming variant id from webhook
- actionType: new_purchase | upgrade_replace | renewal
- product + targetVariant: what entitlement should be created
- versionFrom + versionTo: explicit major version range
- allowedFromVariants: optional upgrade whitelist
- denyFromVariants: optional upgrade blacklist

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

## 3. User Panel Upgrade Offers

User panel now computes available upgrades from active licenses and active upgrade_replace offers.

Implementation:

- src/app/(user-panel)/user-panel/purchases/Purchases.tsx

Eligibility logic summary:

- Uses only active user licenses
- Reads active commerce offers where actionType is upgrade_replace
- Matches source variants against allowedFromVariants/denyFromVariants
- Excludes offers where target variant is already owned

Operational notes:

- If no checkout base URL or target variant id is configured, user sees a configuration warning.
- Reference price is display-only (does not enforce checkout price).

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

- Orders: billing-facing order record
- License Transactions: immutable licensing audit operation
- Licenses: final entitlement state

Collections:

- src/collections/Orders.ts
- src/collections/LicenseTransactions.ts
- src/collections/Licenses.ts

Traceability links:

- Order -> licenseTransaction (direct relation)
- LicenseTransaction -> order (relation on transaction)
- License -> order
- LicenseTransaction -> fromLicense/toLicense and fromVariant/toVariant

Webhook flow:

- src/app/api/webhooks/lemon/route.ts

Behavior summary:

1. Idempotency check by external order id.
2. Offer resolution from commerce-offers.
3. Transaction created as pending.
4. Order created and linked to transaction.
5. License created (or upgrade applied according to policy).
6. Transaction updated to completed or failed.

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
   - post-purchase email
   - user panel upgrade visibility

## 8. Change Log (Keep Updated)

Add one short entry for each sales change.

Template:

- Date: YYYY-MM-DD
- Scope: checkout | offer-policy | webhook | emails | user-panel | support-tools
- Change: one sentence
- Files: list key files
- Validation: types, manual test, automated test

Current entries:

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

## 9. Temporary Email Domain Policy

Collection:

- src/collections/BannedDomains.ts

Helpers:

- src/lib/bannedDomains.ts

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
