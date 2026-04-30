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
import { ProductExtensions } from './collections/ProductExtensions'
import { Licenses } from './collections/Licenses'
import { Installations } from './collections/Installations'
import { WelcomeLicenses } from './collections/WelcomeLicenses'
import { Homepage } from './globals/pages/Homepage'
import { Manual } from './globals/pages/Manual'
import { Downloads } from './globals/pages/Downloads'
import { WelcomeEmail } from './globals/WelcomeEmail'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: AdminUsers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: ['@/components/admin/LogoutButton#LogoutButton'],
    },
  },
  collections: [
    AdminUsers,
    Users,
    Media,
    Pages,
    ContactSubmissions,
    Products,
    ProductExtensions,
    Licenses,
    Installations,
    WelcomeLicenses,
  ],
  globals: [Homepage, Manual, Downloads, WelcomeEmail],
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
