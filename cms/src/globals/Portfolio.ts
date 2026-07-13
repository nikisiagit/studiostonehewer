import type { GlobalConfig } from 'payload'
import { triggerBuildGlobal } from '../hooks/triggerBuild'

export const Portfolio: GlobalConfig = {
  slug: 'portfolio',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [triggerBuildGlobal],
  },
  fields: [
    { name: 'seo_description', type: 'textarea' },
    { name: 'subtitle', type: 'text' },
    { name: 'header_title', type: 'text' },
    { name: 'header_description', type: 'textarea' },
  ],
}
