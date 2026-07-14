import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { seoPlugin } from '@payloadcms/plugin-seo'

import { AdminUsers } from './collections/AdminUsers'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Products } from './collections/Products'
import { ProductVariants } from './collections/ProductVariants'
import { Licenses } from './collections/Licenses'
import { Installations } from './collections/Installations'
import { WelcomeLicenses } from './collections/WelcomeLicenses'
import { CommerceOffers } from './collections/CommerceOffers'
import { DiscountCodes } from './collections/DiscountCodes'
import { ActivationCodeDefinitions } from './collections/ActivationCodeDefinitions'
import { ActivationCodes } from './collections/ActivationCodes'
import { LicenseTransactions } from './collections/LicenseTransactions'
import { BannedDomains } from './collections/BannedDomains'
import { BannedEmails } from './collections/BannedEmails'
import { Homepage } from './globals/pages/Homepage'
import { Manual } from './globals/pages/Manual'
import { Downloads } from './globals/pages/Downloads'
import { RegisterWelcomeEmail } from './globals/RegisterWelcomeEmail'
import { PurchaseWelcomeEmail } from './globals/PurchaseWelcomeEmail'
import Orders from './collections/Orders'
import Affiliates from './collections/Affiliates'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const DEFAULT_SERVER_URL = 'https://mxbeats.com'

const normalizeOrigin = (value: string): string => value.replace(/\/$/, '')

const parseOrigin = (value: string): string | null => {
  try {
    return normalizeOrigin(new URL(value).origin)
  } catch {
    return null
  }
}

const splitEnvOrigins = (value: string | undefined): string[] =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const configuredServerURL = normalizeOrigin(
  process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    DEFAULT_SERVER_URL,
)

const allowedOrigins = Array.from(
  new Set(
    [
      configuredServerURL,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      ...splitEnvOrigins(process.env.TRUSTED_BROWSER_ORIGINS),
      ...splitEnvOrigins(process.env.NEXT_PUBLIC_TRUSTED_BROWSER_ORIGINS),
      'https://mxbeats.com',
      'https://www.mxbeats.com',
      ...(process.env.NODE_ENV === 'production'
        ? []
        : ['http://localhost:3000', 'http://127.0.0.1:3000']),
    ]
      .filter(Boolean)
      .map((item) => parseOrigin(item as string))
      .filter((item): item is string => Boolean(item)),
  ),
)

export default buildConfig({
  admin: {
    user: AdminUsers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: [
        '@/components/admin/ActivationCodesToolsLink#ActivationCodesToolsLink',
        '@/components/admin/LogoutButton#LogoutButton',
      ],
    },
  },
  serverURL: configuredServerURL,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  upload: {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  },
  collections: [
    AdminUsers,
    Users,
    Media,
    Pages,
    Orders,
    ContactSubmissions,
    Products,
    ProductVariants,
    CommerceOffers,
    DiscountCodes,
    ActivationCodeDefinitions,
    ActivationCodes,
    BannedDomains,
    BannedEmails,
    Licenses,
    LicenseTransactions,
    Installations,
    WelcomeLicenses,
    Affiliates,
  ],
  globals: [Homepage, Manual, Downloads, RegisterWelcomeEmail, PurchaseWelcomeEmail],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  email: nodemailerAdapter({
    defaultFromAddress: 'noreply@mxbeats.com',
    defaultFromName: 'MX BEATS',
    transportOptions: {
      host: process.env.SMTP_HOST || 'ssl0.ovh.net',
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    },
  }),
  plugins: [
    seoPlugin({
      collections: ['pages'],
      globals: ['homepage', 'downloads'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `MXbeats — ${doc.title}`,
      generateDescription: ({ doc }) => doc.excerpt,
      tabbedUI: true,
      generateURL: ({ doc }) => {
        if (doc.slug === 'home' || !doc.slug) return 'https://mxbeats.com/'
        return `https://mxbeats.com/${doc.slug}`
      },
    }),
  ],
})
