import type { Access, CollectionConfig } from 'payload'

const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  // Block public self-registration; existing admins can still create users in the panel.
  // Bootstrap the first user via Local API (overrideAccess) or seed script.
  access: {
    create: isAuthenticated,
    read: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    // Email added by default
  ],
}
