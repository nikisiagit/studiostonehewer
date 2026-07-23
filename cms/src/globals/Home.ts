import type { GlobalConfig } from 'payload'
import { triggerBuildGlobal } from '../hooks/triggerBuild'

export const Home: GlobalConfig = {
  slug: 'home',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [triggerBuildGlobal],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'hero_left_image', type: 'upload', relationTo: 'media' },
            { name: 'hero_left_caption', type: 'text' },
            {
              name: 'hero_left_link',
              type: 'text',
              admin: {
                description: 'Link destination for the left hero. Use absolute URLs (e.g., https://example.com) for external sites, and relative paths (e.g., /projects/oud-west) for internal pages. Use # to disable linking.',
              },
            },
            { name: 'hero_right_image', type: 'upload', relationTo: 'media' },
            { name: 'hero_right_caption', type: 'text' },
            {
              name: 'hero_right_link',
              type: 'text',
              admin: {
                description: 'Link destination for the right hero. Use absolute URLs (e.g., https://example.com) for external sites, and relative paths (e.g., /projects/poole-dorset) for internal pages. Use # to disable linking.',
              },
            },
          ],
        },
        {
          label: 'Quote',
          fields: [
            { name: 'quote_text', type: 'textarea' },
            { name: 'quote_author', type: 'text' },
          ],
        },
        {
          label: 'The Studio',
          fields: [
            { name: 'studio_subtitle', type: 'text' },
            { name: 'studio_title', type: 'text' },
            { name: 'studio_description', type: 'textarea' },
          ],
        },
        {
          label: 'Projects Section',
          fields: [
            { name: 'projects_subtitle', type: 'text' },
            { name: 'projects_title', type: 'text' },
            { name: 'projects_description', type: 'textarea' },
          ],
        },
        {
          label: 'How We Work',
          fields: [
            { name: 'hww_subtitle', type: 'text' },
            { name: 'hww_title', type: 'text' },
            { name: 'hww_description', type: 'textarea' },
            { name: 'hww_image', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Digital Studio',
          fields: [
            { name: 'virtual_title', type: 'text' },
            { name: 'virtual_description', type: 'textarea' },
            { name: 'virtual_expectations', type: 'textarea' },
          ],
        },
        {
          label: 'Full Service',
          fields: [
            { name: 'full_title', type: 'text' },
            { name: 'full_description', type: 'textarea' },
            { name: 'full_expectations', type: 'textarea' },
          ],
        },
        {
          label: 'CTA',
          fields: [
            { name: 'cta_title', type: 'text' },
            { name: 'cta_description', type: 'textarea' },
            { name: 'final_cta_title', type: 'text' },
          ],
        },
        {
          label: 'About',
          fields: [
            { name: 'about_subtitle', type: 'text' },
            { name: 'about_title', type: 'text' },
            { name: 'about_image', type: 'upload', relationTo: 'media' },
            { name: 'about_role', type: 'text' },
            { name: 'about_name', type: 'text' },
            { name: 'about_body', type: 'textarea' },
          ],
        },
        {
          label: 'What Guides Us',
          fields: [
            {
              name: 'guides',
              type: 'array',
              labels: {
                singular: 'Guide Item',
                plural: 'Guide Items',
              },
              admin: {
                description: 'Items displayed in the "What guides us" section on the homepage.',
              },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'contact_subtitle', type: 'text' },
            { name: 'contact_title', type: 'text' },
            { name: 'contact_description', type: 'textarea' },
            { name: 'contact_email', type: 'text' },
            { name: 'contact_instagram', type: 'text' },
          ],
        },
      ],
    },
  ],
}
