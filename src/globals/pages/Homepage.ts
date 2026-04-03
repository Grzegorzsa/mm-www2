import type { GlobalConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Pages',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      fields: [
        {
          name: 'headline1',
          type: 'text',
          defaultValue: 'Unlock your',
          label: 'Headline line 1',
        },
        {
          name: 'headline2',
          type: 'text',
          defaultValue: 'creativity',
          label: 'Headline line 2',
        },
        {
          name: 'subline',
          type: 'text',
          defaultValue: 'with our unique music production tool',
          label: 'Subline',
        },
      ],
    },
    {
      name: 'intro',
      type: 'group',
      label: 'Intro Section',
      fields: [
        {
          name: 'text',
          type: 'textarea',
          defaultValue:
            'MXbeats is a cutting-edge music looping software that empowers musicians, producers, and performers to create, arrange, and perform their music with ease and precision.',
          label: 'Intro text',
        },
        {
          name: 'ctaLabel',
          type: 'text',
          defaultValue: 'GET IT NOW',
          label: 'CTA Button label',
        },
        {
          name: 'ctaUrl',
          type: 'text',
          defaultValue: '#pricing',
          label: 'CTA Button URL',
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      label: 'Feature Sections',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'image',
          type: 'text',
          label: 'Image filename (in /images/home/)',
          required: true,
        },
      ],
    },
    {
      name: 'timeline',
      type: 'group',
      label: 'Timeline Section',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Timeline Editor',
          label: 'Heading',
        },
        {
          name: 'subheading',
          type: 'text',
          defaultValue: 'for Complete Song Creation',
          label: 'Subheading',
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            'Compose entire songs with built-in timeline editor. Arrange loops and samples creating cohesive musical pieces.',
          label: 'Description',
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      label: 'Pricing Section',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Get MXbeats',
          label: 'Heading',
        },
        {
          name: 'plans',
          type: 'array',
          label: 'Plans',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'price',
              type: 'number',
              required: true,
            },
            {
              name: 'isHighlighted',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'features',
              type: 'array',
              label: 'Features',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'included',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
