import type { Access, CollectionConfig, FieldAccess } from 'payload'
import { APIError } from 'payload'

const serverURL = () => process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'admin-users') return true
  return { id: { equals: user.id } }
}

const adminOnly: Access = ({ req: { user } }) => {
  return user?.collection === 'admin-users'
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', '_verified', 'blocked', 'createdAt'],
  },
  auth: {
    verify: {
      generateEmailHTML: ({ token }) =>
        `<p>Thank you for registering at MXbeats.</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${serverURL()}/verify-email?token=${token}">Verify Email Address</a></p>
        <p>If you did not create an account, you can safely ignore this email.</p>`,
      generateEmailSubject: () => 'Verify your email – MXbeats',
    },
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token ?? ''
        return `<p>You requested a password reset for your MXbeats account.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${serverURL()}/reset-password?token=${token}">Reset Password</a></p>
        <p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>`
      },
      generateEmailSubject: () => 'Reset your password – MXbeats',
    },
  },
  hooks: {
    beforeOperation: [
      async ({ operation, req }) => {
        if (operation !== 'login') return
        const email = (req.data as { email?: string } | undefined)?.email
        if (!email) return
        const { docs } = await req.payload.find({
          collection: 'users',
          where: { email: { equals: email } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        if (docs[0]?.blocked) {
          throw new APIError('Your account has been blocked. Please contact support.', 403)
        }
      },
    ],
  },
  access: {
    create: () => true,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'blocked',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Prevent this user from logging in',
      },
      access: {
        create: adminOnly as FieldAccess,
        update: adminOnly as FieldAccess,
      },
    },
    {
      name: 'info',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Optional notes about this user',
      },
    },
  ],
  timestamps: true,
}
