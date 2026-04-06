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
      type: 'collapsible',
      label: 'Hero Section',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'hero',
          type: 'group',
          label: false,
          fields: [
            {
              name: 'heroImage',
              label: 'Hero Image',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'headline1',
                  type: 'text',
                  defaultValue: 'Unlock your',
                  label: 'Headline line 1',
                  admin: {
                    width: '33.3%',
                  },
                },
                {
                  name: 'headline2',
                  type: 'text',
                  defaultValue: 'creativity',
                  label: 'Headline line 2',
                  admin: {
                    width: '33.3%',
                  },
                },
                {
                  name: 'subline',
                  type: 'text',
                  defaultValue: 'with our unique music production tool',
                  label: 'Subline',
                  admin: {
                    width: '33.3%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Intro Section',
      admin: {
        initCollapsed: true,
      },
      fields: [
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
              type: 'row',
              fields: [
                {
                  name: 'ctaLabel',
                  type: 'text',
                  defaultValue: 'GET IT NOW',
                  label: 'CTA Button label',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'ctaUrl',
                  type: 'text',
                  defaultValue: '#pricing',
                  label: 'CTA Button URL',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Features Section',
      admin: {
        initCollapsed: true,
      },
      fields: [
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
              label: 'Feature Image',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Timeline Section',
      admin: {
        initCollapsed: true,
      },
      fields: [
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
            {
              name: 'image',
              label: 'Timeline Video/Image',
              type: 'upload',
              relationTo: 'media',
              required: false,
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Pricing Section',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'pricing',
          type: 'array',
          label: 'Pricing Sections',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  type: 'text',
                  name: 'feature',
                  label: 'Feature',
                  required: true,
                  admin: { width: '33.3%' },
                },
                {
                  type: 'text',
                  name: 'essentials',
                  label: 'Essentials',
                  required: true,
                  admin: { width: '33.3%' },
                },
                {
                  type: 'text',
                  name: 'loops',
                  label: 'Loops',
                  required: true,
                  admin: { width: '33.3%' },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Try Demo Section',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'demo',
          type: 'group',
          label: 'Demo Section',
          fields: [
            {
              type: 'text',
              name: 'demoHeading',
              label: 'Heading',
              required: true,
            },
            {
              type: 'textarea',
              name: 'demoDescription',
              label: 'Description',
              required: true,
            },
            {
              type: 'text',
              name: 'demoUrl',
              label: 'Demo URL',
              required: true,
            },
            { type: 'text', name: 'demoBtnLabel', label: 'CTA Button Label', required: true },
          ],
        },
      ],
    },
  ],
}
