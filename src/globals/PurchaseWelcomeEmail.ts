import type { GlobalConfig } from 'payload'
import { purchaseWelcomeEmailDefaults } from './purchaseWelcomeEmailContent'

const supportedVariables =
  '{{applicationName}}, {{variantName}}, {{loginEmail}}, {{loginPassword}}, {{externalOrderId}}, {{downloadsUrl}}, {{userPanelUrl}}, {{signInUrl}}, {{accountSecurityNotice}}'

export const PurchaseWelcomeEmail: GlobalConfig = {
  slug: 'purchase-welcome-email',
  label: 'Purchase Welcome Email',
  admin: {
    description:
      'Email template sent after a successful purchase. Supported template variables: ' +
      supportedVariables,
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
      defaultValue: purchaseWelcomeEmailDefaults.subject,
      admin: {
        description: `Available variables: ${supportedVariables}`,
      },
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      defaultValue: purchaseWelcomeEmailDefaults.text,
      admin: {
        description: `Plain text version. Available variables: ${supportedVariables}`,
      },
    },
    {
      name: 'html',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: `HTML version. Available variables: ${supportedVariables}`,
      },
      defaultValue: purchaseWelcomeEmailDefaults.html,
    },
  ],
}
