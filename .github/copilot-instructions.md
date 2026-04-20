# Project Context & Standards: mm-api

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **CMS:** Payload 3.0 (Postgres via @payloadcms/db-postgres)
- **Styling:** Tailwind CSS 4.x
- **Components:** Shadcn UI (Conditional usage)
- **Runtime:** Node.js 20+ with pnpm

## UI/UX Development Rules

- **Frontend (`src/app/(frontend)`):** - DO NOT use Shadcn UI components here.
  - Use native Tailwind CSS 4 classes and standard HTML elements/React components.
  - Prioritize `@tailwindcss/typography` for content-heavy sections.
- **User Dashboard/Panel:** - Use Shadcn UI components, Radix UI, and `lucide-react` icons.
  - Use `class-variance-authority` and `tailwind-merge` for component composition.

## Payload 3.0 Patterns

- Use **Lexical** for rich text editors (as per `@payloadcms/richtext-lexical`).
- **Data Seeding:** The project uses modular seeding. Reference `src/seed/` for logic.
  - `pages.ts`: General page structure.
  - `homepage.ts`: Specific homepage content.
  - `manual.ts`: Manual data entries.
- Always generate types using `payload generate:types` when schemas change.

## Coding Preferences

- **Language:** TypeScript 5.7+ (Strict mode).
- **Icons:** Always use `lucide-react`.
- **Naming:** PascalCase for components, camelCase for functions/variables.
- **Imports:** Use clean import maps as per Payload 3.0 configuration.

## Language Policy

- All code-level strings, comments, UI text, and CMS data (seeds) must be in **English**.
- Even if prompted in Polish, always provide English outputs for the codebase.

## Architecture

- Maintain clear separation between Payload collections and Next.js frontend components.
- Use `cross-env` for environment-specific scripts as defined in `package.json`.

## Panel Page Structure

**Purpose:** Keep `page.tsx` files minimal and focused on metadata. Extract page logic into dedicated component files.

**Naming Convention:**

- Component file: `ComponentName.tsx` (e.g., `Purchases.tsx`, `Downloads.tsx`, `Account.tsx`)
- Page file: `page.tsx` (minimal, only imports the component)
- Component export: Named export (e.g., `export async function Purchases()`)

**Pattern:**

Each page (e.g., `src/app/(panel)/panel/purchases/`) follows this structure:

```
purchases/
├── Purchases.tsx        # Server Component with business logic
└── page.tsx             # Minimal page wrapper, exports metadata
```

**Purchases.tsx** (Server Component):

```typescript
import type { Metadata } from 'next'
// ...imports...

export async function Purchases() {
  // Fetch data, process logic
  return (
    <div>
      {/* Page content */}
    </div>
  )
}
```

**page.tsx** (Minimal wrapper):

```typescript
import type { Metadata } from 'next'
import { Purchases } from './Purchases'

export const metadata: Metadata = { title: 'Purchases — MXbeats' }

export default function PurchasesPage() {
  return <Purchases />
}
```

**Benefits:**

- Clear separation of concerns (routing vs. logic)
- Easier to maintain and test
- Consistent naming across all panel pages
- Reusable components (same component can be used in multiple pages if needed)
