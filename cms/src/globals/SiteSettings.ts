import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    { name: 'site_title', type: 'text' },
    { name: 'site_description', type: 'textarea' },
    {
      name: 'nav_logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'nav_links',
      type: 'textarea',
      admin: {
        description: 'Format: LABEL | /url',
      },
    },
  ],
}
