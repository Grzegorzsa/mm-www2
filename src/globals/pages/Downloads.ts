import type { GlobalConfig } from 'payload'

export const Downloads: GlobalConfig = {
  slug: 'downloads',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Pages',
  },
  fields: [
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
          label: false,
          fields: [
            {
              name: 'text',
              type: 'textarea',
              required: true,
              admin: {
                description: 'Introductory paragraph shown above the download list',
              },
            },
            {
              name: 'note',
              type: 'textarea',
              required: true,
              admin: {
                description: 'Note shown at the bottom of the page (e.g. registration requirement)',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'downloads',
      type: 'array',
      required: true,
      admin: {
        description: 'Download groups (e.g. Windows, macOS)',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Group heading (e.g. "Installer for MS Windows 64 bit")',
          },
        },
        {
          name: 'files',
          type: 'array',
          required: true,
          admin: {
            description: 'Individual files available for this group',
          },
          fields: [
            {
              name: 'description',
              type: 'text',
              required: true,
            },
            {
              name: 'version',
              type: 'text',
              required: false,
              admin: {
                description: 'Version number (e.g. 1.2.0)',
              },
            },
            {
              name: 'fileName',
              type: 'text',
              required: true,
            },
            {
              name: 'size',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
