import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Affiliates: CollectionConfig = {
  slug: 'affiliates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'affiliateCode', 'active', 'user'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Friendly name or company name for this partner',
            width: '40%',
          },
        },
        {
          name: 'affiliateCode',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'Tracking code used in URLs or embedded in Player keys (e.g. "john20")',
            width: '40%',
          },
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
          required: true,
          admin: {
            description: 'Toggle to temporarily disable tracking and payouts',
            width: '20%',
          },
        },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'Link to the actual user account registered in our system',
      },
    },

    // --- REGUŁA 1: Zakupy przez Linki (np. Lemon Squeezy) ---
    {
      name: 'linkStrategy',
      type: 'group',
      label: 'Link-based Payout Strategy (Webstore)',
      admin: {
        description: 'Rules applied when a user registers or buys via an affiliate tracking link',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: 'Enable Link Commission',
              defaultValue: true,
              admin: { width: '20%' },
            },
            {
              name: 'isLifetime',
              type: 'checkbox',
              label: 'Enable Lifetime Payouts for subsequent purchases?',
              defaultValue: true, // W Twoim przypadku: TAK, bo chcemy dawać 10% na kolejne zakupy
              admin: { width: '40%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'firstPurchaseRate',
              type: 'number',
              label: 'First Purchase Rate (%)',
              defaultValue: 20, // Pierwszy zakup z linku = 20%
              required: true,
              admin: {
                width: '50%',
                description: "Commission for the user's very first transaction",
              },
            },
            {
              name: 'subsequentPurchaseRate',
              type: 'number',
              label: 'Subsequent Purchases Rate (%)',
              defaultValue: 10, // Każdy kolejny zakup = 10%
              required: true,
              admin: {
                width: '50%',
                description: 'Commission for following purchases (only if Lifetime is enabled)',
                // Dodatkowa zaleta Payload CMS: możemy ukryć to pole w panelu, jeśli isLifetime jest wyłączone!
                condition: (data, siblingData) => siblingData?.isLifetime === true,
              },
            },
          ],
        },
      ],
    },

    // --- REGUŁA 2: Aktywacja przez Licencję/Trial (Aplikacja) ---
    {
      name: 'keyStrategy',
      type: 'group',
      label: 'Key-activation Payout Strategy (Player / Special Trial)',
      admin: {
        description:
          'Rules applied when a user binds their account using a physical license key from this partner',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: 'Enable Key-activation Commission',
              defaultValue: true,
              admin: { width: '30%' },
            },
            {
              name: 'isLifetime',
              type: 'checkbox',
              label: 'Is Lifetime? (If checked, commissions apply to all future purchases)',
              defaultValue: true, // Domyślnie dla specjalnych wersji Player / Trial
              admin: { width: '40%' },
            },
            {
              name: 'commissionRate',
              type: 'number',
              label: 'Commission Rate (%)',
              defaultValue: 10, // Np. 10% dla stałych poleceń z aplikacji
              required: true,
              admin: { width: '30%' },
            },
          ],
        },
      ],
    },

    // --- Pole informacyjne / powód blokady ---
    {
      name: 'info',
      type: 'textarea',
      admin: {
        description: 'Internal admin notes, logs, or reasons for deactivation',
      },
    },
  ],
  timestamps: true,
}

export default Affiliates
