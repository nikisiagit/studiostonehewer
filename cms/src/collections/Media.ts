import type { CollectionConfig } from 'payload'

/**
 * Media uploads no longer trigger a site rebuild by themselves.
 * Rebuilding on every upload was noisy; projects/globals still trigger builds
 * after content that references media is saved.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
    mimeTypes: ['image/*'],
  },
}
