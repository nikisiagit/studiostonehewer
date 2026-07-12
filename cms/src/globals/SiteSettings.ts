import type { GlobalConfig } from 'payload'
import { triggerBuildGlobal } from '../hooks/triggerBuild'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [triggerBuildGlobal],
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
