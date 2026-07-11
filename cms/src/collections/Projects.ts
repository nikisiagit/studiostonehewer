import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'tag',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., RESIDENTIAL or COMMERCIAL',
      },
    },
    {
      name: 'year',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short description for the project card',
      },
    },
    {
      name: 'intro_text_1',
      type: 'textarea',
    },
    {
      name: 'intro_text_2',
      type: 'textarea',
    },
    {
      name: 'gallery',
      type: 'array',
      labels: {
        singular: 'Gallery Image',
        plural: 'Gallery Images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'size',
          type: 'select',
          options: [
            { label: 'Regular', value: 'regular' },
            { label: 'Tall', value: 'tall' },
            { label: 'Wide', value: 'wide' },
          ],
          defaultValue: 'regular',
          required: true,
        },
      ],
    },
  ],
}
