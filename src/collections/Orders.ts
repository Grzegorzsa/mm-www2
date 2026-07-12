import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrOwner } from '@/access/isAdminOrOwner'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'externalOrderId',
    defaultColumns: [
      'externalOrderId',
      'lemonOrderId',
      'source',
      'transactionType',
      'amount',
      'createdAt',
    ],
  },
  access: {
    // Użytkownik widzi swoje zamówienia (szukane po polu 'user'), admin widzi wszystkie
    read: isAdminOrOwner('user'),

    // Tworzenie rekordów tylko po stronie zaufanego serwera (webhook / backend route)
    create: isAdmin,

    // Tylko admin może modyfikować lub usuwać zamówienia (choć z założenia powinny być niezmienne)
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Lemon Squeezy', value: 'lemon_squeezy' },
        { label: 'Plugin Boutique', value: 'plugin_boutique' },
      ],
    },
    {
      name: 'externalOrderId',
      type: 'text',
      required: true,
      admin: {
        description: 'External order number visible in Lemon Squeezy (order_number).',
      },
    },
    {
      name: 'lemonOrderId',
      type: 'text',
      admin: {
        description: 'Technical Lemon Squeezy Order resource id (event.data.id).',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Transaction amount in cents/lowest currency unit (integer)',
      },
    },
    {
      name: 'transactionType',
      type: 'select',
      defaultValue: 'new_purchase',
      options: [
        { label: 'New Purchase', value: 'new_purchase' },
        { label: 'Upgrade', value: 'upgrade' },
        { label: 'Crossgrade', value: 'crossgrade' },
        { label: 'Renewal', value: 'renewal' },
      ],
    },
    {
      name: 'licenseTransaction',
      type: 'relationship',
      relationTo: 'license-transactions',
      admin: {
        description: 'Audit record of the licensing operation triggered by this order.',
      },
    },
    {
      name: 'discountCode',
      type: 'relationship',
      relationTo: 'discount-codes',
      admin: {
        description: 'Discount code used to create this order, if any.',
      },
    },
    {
      name: 'discountBaseAmountCents',
      type: 'number',
      admin: {
        description: 'Checkout subtotal before applying the discount code.',
      },
    },
    {
      name: 'discountAmountCents',
      type: 'number',
      admin: {
        description: 'Amount discounted from the checkout subtotal, in cents.',
      },
    },
    {
      name: 'affiliatePartner',
      type: 'relationship',
      relationTo: 'affiliates',
    },
    {
      name: 'affiliateRate',
      type: 'number',
      admin: {
        description: 'Commission percentage granted for this specific order (e.g., 10 or 20)',
      },
    },
    {
      name: 'affiliatePayoutStatus',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Pending Payout', value: 'pending' },
        { label: 'Paid', value: 'paid' },
      ],
    },
  ],
}

export default Orders
