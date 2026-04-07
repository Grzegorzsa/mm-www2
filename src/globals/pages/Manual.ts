import type { GlobalConfig } from 'payload'

export const Manual: GlobalConfig = {
  slug: 'manual',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Pages',
  },
  fields: [
    {
      name: 'aside',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'Sidebar navigation HTML',
      },
    },
    {
      name: 'mobileToc',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'Mobile table of contents HTML',
      },
    },
    {
      name: 'sections',
      type: 'array',
      required: true,
      admin: {
        description: 'Manual sections rendered in order',
      },
      fields: [
        {
          name: 'html',
          type: 'code',
          required: true,
          admin: {
            language: 'html',
            description: 'Section HTML content',
          },
        },
      ],
    },
  ],
}
