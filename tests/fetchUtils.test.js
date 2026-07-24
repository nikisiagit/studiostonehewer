const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { sanitizeHref, isStrictPayload, toPublicMediaUrl } = require('../src/_data/fetchUtils.js')

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
    } finally {
      if (prev === undefined) delete process.env.MEDIA_PUBLIC_URL
      else process.env.MEDIA_PUBLIC_URL = prev
      if (prevDisable === undefined) delete process.env.DISABLE_MEDIA_PUBLIC_URL
      else process.env.DISABLE_MEDIA_PUBLIC_URL = prevDisable
    }
  })
})
