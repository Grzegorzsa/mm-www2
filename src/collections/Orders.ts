import { CollectionConfig } from 'payload/types'

const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'externalOrderId',
    defaultColumns: ['externalOrderId', 'source', 'amount', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Admin widzi wszystko, zalogowany użytkownik tylko swoje zamówienia
      if (user?.role === 'admin') return true
      return { user: { equals: user?.id } }
    },
    create: () => true, // Zezwalamy na tworzenie zamówień przez webhook
    update: () => false, // Raz zapisane zamówienie finansowe powinno być niezmienialne
    delete: () => false,
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
        description: 'The order identifier from the external system (e.g., Order Number)',
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
    // Sekcja Afiliacyjna - zamrażana w strukturze zamówienia w momencie zakupu
    {
      name: 'affiliatePartner',
      type: 'relationship',
      relationTo: 'users',
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
