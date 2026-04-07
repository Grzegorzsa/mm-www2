import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug (e.g. terms-and-conditions)',
      },
    },
    {
      name: 'pageType',
      type: 'select',
      options: [
        { label: 'Policy Page', value: 'policy' },
        { label: 'Contact Form', value: 'contact' },
        { label: 'Generic', value: 'generic' },
      ],
      defaultValue: 'generic',
      admin: {
        description: 'Page layout type',
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
    },
  ],
}
