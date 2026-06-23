import type { GlobalConfig } from 'payload'
import { registerWelcomeEmailDefaults } from './registerWelcomeEmailContent'

export const RegisterWelcomeEmail: GlobalConfig = {
  slug: 'register-welcome-email',
  label: 'Register Welcome Email',
  admin: {
    description:
      'Email template sent to new users after email verification, along with welcome licenses',
  },
  access: {
    read: ({ req: { user } }) => user?.collection === 'admin-users',
    update: ({ req: { user } }) => user?.collection === 'admin-users',
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      defaultValue: registerWelcomeEmailDefaults.subject,
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      defaultValue: registerWelcomeEmailDefaults.text,
      admin: {
        description: 'Plain text version of the email',
      },
    },
    {
      name: 'html',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'HTML version of the email',
      },
      defaultValue: registerWelcomeEmailDefaults.html,
    },
  ],
}
