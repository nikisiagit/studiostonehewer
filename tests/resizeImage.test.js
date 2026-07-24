const { describe, it, after } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

// Load the filter the same way Eleventy would register it
function loadResizeFilter() {
  let filter
  const fakeConfig = {
    addPassthroughCopy() {},
    addFilter(name, fn) {
      if (name === 'resizeImage') filter = fn
    },
  }
  // Clear require cache so env changes apply
  const configPath = path.join(__dirname, '..', '.eleventy.js')
  delete require.cache[require.resolve(configPath)]
  require(configPath)(fakeConfig)
  return filter
}

describe('resizeImage filter', () => {
  const prev = process.env.DISABLE_CF_IMAGE_RESIZE

  after(() => {
    if (prev === undefined) delete process.env.DISABLE_CF_IMAGE_RESIZE
    else process.env.DISABLE_CF_IMAGE_RESIZE = prev
  })

  it('wraps remote URLs with cdn-cgi image options', () => {
    delete process.env.DISABLE_CF_IMAGE_RESIZE
    const resizeImage = loadResizeFilter()
    const out = resizeImage('https://admin.example.com/api/media/file/a.jpg', 800, 80)
    assert.match(out, /^\/cdn-cgi\/image\/width=800,quality=80,format=auto,fit=scale-down\//)
    assert.ok(out.endsWith('https://admin.example.com/api/media/file/a.jpg'))
  })

  it('leaves local assets unchanged', () => {
    delete process.env.DISABLE_CF_IMAGE_RESIZE
    const resizeImage = loadResizeFilter()
    assert.equal(resizeImage('/assets/images/x.png', 400, 80), '/assets/images/x.png')
  })

  it('can be disabled via env', () => {
    process.env.DISABLE_CF_IMAGE_RESIZE = '1'
    const resizeImage = loadResizeFilter()
    const url = 'https://admin.example.com/img.jpg'
    assert.equal(resizeImage(url, 1200, 85), url)
  })
})
