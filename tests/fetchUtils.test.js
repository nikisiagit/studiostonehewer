const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  sanitizeHref,
  isStrictPayload,
  toPublicMediaUrl,
  resolveMediaUrl,
} = require('../src/_data/fetchUtils.js')

describe('sanitizeHref', () => {
  it('allows relative paths and hashes', () => {
    assert.equal(sanitizeHref('/projects/oud-west'), '/projects/oud-west')
    assert.equal(sanitizeHref('#contact'), '#contact')
  })

  it('allows http(s) URLs', () => {
    assert.equal(sanitizeHref('https://example.com/x'), 'https://example.com/x')
    assert.equal(sanitizeHref('http://example.com'), 'http://example.com')
  })

  it('blocks javascript and data URLs', () => {
    assert.equal(sanitizeHref('javascript:alert(1)'), '#')
    assert.equal(sanitizeHref('data:text/html,hi'), '#')
    assert.equal(sanitizeHref('vbscript:foo'), '#')
  })

  it('uses custom fallback', () => {
    assert.equal(sanitizeHref('javascript:x', '/'), '/')
  })
})

describe('isStrictPayload', () => {
  it('reflects CI / STRICT_PAYLOAD env', () => {
    const prevCI = process.env.CI
    const prevStrict = process.env.STRICT_PAYLOAD
    try {
      delete process.env.CI
      delete process.env.STRICT_PAYLOAD
      assert.equal(isStrictPayload(), false)
      process.env.CI = 'true'
      assert.equal(isStrictPayload(), true)
    } finally {
      if (prevCI === undefined) delete process.env.CI
      else process.env.CI = prevCI
      if (prevStrict === undefined) delete process.env.STRICT_PAYLOAD
      else process.env.STRICT_PAYLOAD = prevStrict
    }
  })
})

describe('toPublicMediaUrl', () => {
  it('rewrites Payload media paths to the R2 public host', () => {
    const prev = process.env.MEDIA_PUBLIC_URL
    const prevDisable = process.env.DISABLE_MEDIA_PUBLIC_URL
    try {
      delete process.env.DISABLE_MEDIA_PUBLIC_URL
      process.env.MEDIA_PUBLIC_URL = 'https://media.studiostonehewer.co.uk'
      assert.equal(
        toPublicMediaUrl('https://admin.studiostonehewer.co.uk/api/media/file/hero.jpg'),
        'https://media.studiostonehewer.co.uk/hero.jpg',
      )
      assert.equal(
        toPublicMediaUrl('/api/media/file/logo.svg'),
        'https://media.studiostonehewer.co.uk/logo.svg',
      )
      assert.equal(
        toPublicMediaUrl('http://127.0.0.1:3000/api/media/file/hero.jpg'),
        'https://media.studiostonehewer.co.uk/hero.jpg',
      )
    } finally {
      if (prev === undefined) delete process.env.MEDIA_PUBLIC_URL
      else process.env.MEDIA_PUBLIC_URL = prev
      if (prevDisable === undefined) delete process.env.DISABLE_MEDIA_PUBLIC_URL
      else process.env.DISABLE_MEDIA_PUBLIC_URL = prevDisable
    }
  })

  it('strips loopback hosts for non-media absolute URLs', () => {
    const prevDisable = process.env.DISABLE_MEDIA_PUBLIC_URL
    try {
      delete process.env.DISABLE_MEDIA_PUBLIC_URL
      assert.equal(
        toPublicMediaUrl('http://127.0.0.1:3000/assets/images/project-1-1.jpeg'),
        '/assets/images/project-1-1.jpeg',
      )
      assert.equal(
        toPublicMediaUrl('http://localhost:3000/assets/images/x.png'),
        '/assets/images/x.png',
      )
    } finally {
      if (prevDisable === undefined) delete process.env.DISABLE_MEDIA_PUBLIC_URL
      else process.env.DISABLE_MEDIA_PUBLIC_URL = prevDisable
    }
  })
})

describe('resolveMediaUrl', () => {
  it('keeps site-static assets relative (never prefixes CMS base)', () => {
    assert.equal(
      resolveMediaUrl('/assets/images/project-1-1.jpeg', 'http://127.0.0.1:3000'),
      '/assets/images/project-1-1.jpeg',
    )
    assert.equal(
      resolveMediaUrl('/images/logo.png', 'http://127.0.0.1:3000'),
      '/images/logo.png',
    )
  })

  it('rewrites CMS media paths via the public host', () => {
    const prev = process.env.MEDIA_PUBLIC_URL
    const prevDisable = process.env.DISABLE_MEDIA_PUBLIC_URL
    try {
      delete process.env.DISABLE_MEDIA_PUBLIC_URL
      process.env.MEDIA_PUBLIC_URL = 'https://media.studiostonehewer.co.uk'
      assert.equal(
        resolveMediaUrl('/api/media/file/hero.jpg', 'http://127.0.0.1:3000'),
        'https://media.studiostonehewer.co.uk/hero.jpg',
      )
      assert.equal(
        resolveMediaUrl('http://127.0.0.1:3000/api/media/file/hero.jpg', 'http://127.0.0.1:3000'),
        'https://media.studiostonehewer.co.uk/hero.jpg',
      )
    } finally {
      if (prev === undefined) delete process.env.MEDIA_PUBLIC_URL
      else process.env.MEDIA_PUBLIC_URL = prev
      if (prevDisable === undefined) delete process.env.DISABLE_MEDIA_PUBLIC_URL
      else process.env.DISABLE_MEDIA_PUBLIC_URL = prevDisable
    }
  })

  it('never returns a loopback host', () => {
    const out = resolveMediaUrl(
      'http://127.0.0.1:3000/assets/images/x.jpeg',
      'http://127.0.0.1:3000',
    )
    assert.ok(!/127\.0\.0\.1|localhost/i.test(out))
    assert.equal(out, '/assets/images/x.jpeg')
  })
})
