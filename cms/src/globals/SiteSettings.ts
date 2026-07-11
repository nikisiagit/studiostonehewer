import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    { name: 'site_title', type: 'text' },
    { name: 'site_description', type: 'textarea' },
    {
      name: 'nav_links',
      type: 'textarea',
      admin: {
        description: 'Format: LABEL | /url',
      },
    },
  ],
}
