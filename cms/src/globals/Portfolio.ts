import type { GlobalConfig } from 'payload'

export const Portfolio: GlobalConfig = {
  slug: 'portfolio',
  access: {
    read: () => true,
  },
  fields: [
    { name: 'seo_description', type: 'textarea' },
    { name: 'subtitle', type: 'text' },
    { name: 'header_title', type: 'text' },
    { name: 'header_description', type: 'textarea' },
  ],
}
