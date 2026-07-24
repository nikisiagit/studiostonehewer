import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users via Local API', async () => {
    const users = await payload.find({
      collection: 'users',
      overrideAccess: true,
    })
    expect(users).toBeDefined()
    expect(Array.isArray(users.docs)).toBe(true)
  })

  it('denies unauthenticated user creation (no public signup)', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: `public-signup-${Date.now()}@example.com`,
          password: 'should-not-work-123',
        },
        overrideAccess: false,
        user: undefined,
      }),
    ).rejects.toThrow()
  })

  it('allows public read of projects', async () => {
    const projects = await payload.find({
      collection: 'projects',
      overrideAccess: false,
      user: undefined,
    })
    expect(projects).toBeDefined()
    expect(Array.isArray(projects.docs)).toBe(true)
  })

  it('denies unauthenticated project create', async () => {
    await expect(
      payload.create({
        collection: 'projects',
        data: {
          title: 'Unauthorized Project',
          tag: 'TEST',
          year: '2026',
          description: 'Should not be created',
        },
        overrideAccess: false,
        user: undefined,
      }),
    ).rejects.toThrow()
  })
})
