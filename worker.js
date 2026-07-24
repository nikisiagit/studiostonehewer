const ALLOWED_ORIGINS = new Set([
  'https://studiostonehewer.co.uk',
  'https://www.studiostonehewer.co.uk',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
])

const ALLOWED_IMAGE_HOSTS = new Set([
  'admin.studiostonehewer.co.uk',
  'media.studiostonehewer.co.uk',
  'studiostonehewer.co.uk',
  'www.studiostonehewer.co.uk',
])

const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...SECURITY_HEADERS,
      ...extraHeaders,
    },
  })
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeSubject(value) {
  return String(value).replace(/[\r\n\0]/g, ' ').trim().slice(0, CONTACT_LIMITS.name)
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false
  if (email.length > CONTACT_LIMITS.email) return false
  if (/[\r\n\0]/.test(email)) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin')
  if (!origin) return true
  if (ALLOWED_ORIGINS.has(origin)) return true
  try {
    const { hostname } = new URL(origin)
    if (hostname === 'studiostonehewer.co.uk' || hostname.endsWith('.studiostonehewer.co.uk')) {
      return true
    }
  } catch {
    return false
  }
  return false
}

async function verifyTurnstile(token, ip, secret) {
  if (!secret) {
    // Fail closed in production when secret is expected
    console.error('TURNSTILE_SECRET_KEY is not configured')
    return false
  }
  if (!token || typeof token !== 'string') return false

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)
  if (ip) body.set('remoteip', ip)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    console.error('Turnstile siteverify HTTP', res.status)
    return false
  }
  const data = await res.json()
  return data.success === true
}

async function isRateLimited(env, request) {
  if (!env.CONTACT_RATE_LIMITER) {
    // Fallback Cache API if binding missing (local / older deploys)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const cache = caches.default
    const key = new Request(`https://rate-limit.internal/contact/${encodeURIComponent(ip)}`)
    const existing = await cache.match(key)
    let count = 0
    if (existing) count = Number.parseInt(await existing.text(), 10) || 0
    if (count >= 5) return true
    await cache.put(
      key,
      new Response(String(count + 1), { headers: { 'Cache-Control': 'max-age=60' } }),
    )
    return false
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: `contact:${ip}` })
  return !success
}

function cacheHeadersForPath(pathname) {
  if (pathname === '/' || pathname.endsWith('.html') || pathname.endsWith('/')) {
    return { 'Cache-Control': 'public, max-age=60, must-revalidate' }
  }
  if (/\.(css|js|woff2?|ttf|otf|ico|svg|png|jpe?g|webp|avif|gif|map)$/i.test(pathname)) {
    return { 'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400' }
  }
  return {}
}

/**
 * Image optimization via Workers cf.image.
 * URL shape: /_img/width=1200,quality=85,format=auto/<absolute-or-relative-source>
 */
async function handleImageTransform(request, url) {
  const prefix = '/_img/'
  if (!url.pathname.startsWith(prefix)) return null

  const rest = url.pathname.slice(prefix.length)
  const httpIdx = rest.search(/https?:\/\//i)
  if (httpIdx === -1) {
    return new Response('Missing source image URL', { status: 400, headers: SECURITY_HEADERS })
  }

  const optionsStr = rest.slice(0, httpIdx).replace(/\/$/, '')
  let source = rest.slice(httpIdx)
  try {
    source = decodeURIComponent(source)
  } catch {
    /* keep raw */
  }

  let sourceUrl
  try {
    sourceUrl = new URL(source)
  } catch {
    return new Response('Invalid source image URL', { status: 400, headers: SECURITY_HEADERS })
  }

  if (!ALLOWED_IMAGE_HOSTS.has(sourceUrl.hostname)) {
    return new Response('Source host not allowed', { status: 403, headers: SECURITY_HEADERS })
  }

  const image = {}
  for (const part of optionsStr.split(',').filter(Boolean)) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq)
    const value = part.slice(eq + 1)
    if (key === 'width' || key === 'height' || key === 'quality') {
      const n = Number(value)
      if (Number.isFinite(n) && n > 0) image[key] = Math.min(n, 4096)
    } else if (key === 'fit' && value) {
      image.fit = value
    } else if (key === 'format') {
      if (value === 'auto') {
        const accept = request.headers.get('Accept') || ''
        if (/image\/avif/.test(accept)) image.format = 'avif'
        else if (/image\/webp/.test(accept)) image.format = 'webp'
      } else if (['avif', 'webp', 'jpeg', 'png'].includes(value)) {
        image.format = value
      }
    }
  }

  try {
    const upstream = await fetch(sourceUrl.toString(), {
      cf: { image },
    })
    const headers = new Headers(upstream.headers)
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v)
    headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400')
    return new Response(upstream.body, { status: upstream.status, headers })
  } catch (err) {
    console.error('Image transform failed:', err)
    // Fall back to original image so the site still loads if cf.image is unavailable
    return fetch(sourceUrl.toString())
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Optimized images (Workers Images binding via cf.image)
    if (url.pathname.startsWith('/_img/')) {
      return handleImageTransform(request, url)
    }

    // Avoid noisy 500s when browsers request a missing favicon
    if (url.pathname === '/favicon.ico') {
      const assetResponse = await env.ASSETS.fetch(request)
      if (assetResponse.ok) {
        const headers = new Headers(assetResponse.headers)
        for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
          headers.set(key, value)
        }
        headers.set('Cache-Control', 'public, max-age=86400')
        return new Response(assetResponse.body, {
          status: assetResponse.status,
          headers,
        })
      }
      return new Response(null, {
        status: 204,
        headers: {
          ...SECURITY_HEADERS,
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    // Contact Form Endpoint
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        if (!isAllowedOrigin(request)) {
          return jsonResponse({ error: 'Forbidden' }, 403)
        }

        if (await isRateLimited(env, request)) {
          return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429)
        }

        let name, email, message, honeypot, turnstileToken
        const contentType = request.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
          const body = await request.json()
          name = body.name
          email = body.email
          message = body.message
          honeypot = body.website || body.company
          turnstileToken = body['cf-turnstile-response'] || body.turnstileToken
        } else {
          const formData = await request.formData()
          name = formData.get('name')
          email = formData.get('email')
          message = formData.get('message')
          honeypot = formData.get('website') || formData.get('company')
          turnstileToken = formData.get('cf-turnstile-response')
        }

        // Honeypot: bots fill hidden fields — pretend success
        if (honeypot) {
          return jsonResponse({ success: true })
        }

        const ip = request.headers.get('CF-Connecting-IP') || undefined
        const turnstileOk = await verifyTurnstile(turnstileToken, ip, env.TURNSTILE_SECRET_KEY)
        if (!turnstileOk) {
          return jsonResponse({ error: 'Bot verification failed. Please try again.' }, 403)
        }

        if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
          return jsonResponse({ error: 'Missing required fields' }, 400)
        }

        name = name.trim()
        email = email.trim()
        message = message.trim()

        if (!name || !email || !message) {
          return jsonResponse({ error: 'Missing required fields' }, 400)
        }

        if (name.length > CONTACT_LIMITS.name || message.length > CONTACT_LIMITS.message) {
          return jsonResponse({ error: 'One or more fields exceed the maximum length' }, 400)
        }

        if (!isValidEmail(email)) {
          return jsonResponse({ error: 'Invalid email address' }, 400)
        }

        const safeName = escapeHtml(name)
        const safeEmail = escapeHtml(email)
        const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')

        const html = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        `

        const text = `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`

        await env.EMAIL.send({
          from: { email: 'notifications@studiostonehewer.co.uk', name: 'Studio Stonehewer' },
          to: 'studiostonehewer@gmail.com',
          replyTo: email,
          subject: `New Inquiry from ${sanitizeSubject(name)}`,
          html,
          text,
        })

        return jsonResponse({ success: true })
      } catch (err) {
        console.error('Contact form error:', err)
        return jsonResponse({ error: 'Unable to send message' }, 500)
      }
    }

    if (url.pathname === '/api/contact' && request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin') || ''
      if (origin && !isAllowedOrigin(request)) {
        return new Response(null, { status: 403 })
      }
      return new Response(null, {
        status: 204,
        headers: {
          ...SECURITY_HEADERS,
          'Access-Control-Allow-Origin': origin || 'https://studiostonehewer.co.uk',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin',
        },
      })
    }

    // Serve static Eleventy site assets for all other routes
    const assetResponse = await env.ASSETS.fetch(request)
    const headers = new Headers(assetResponse.headers)
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(key, value)
    }
    for (const [key, value] of Object.entries(cacheHeadersForPath(url.pathname))) {
      headers.set(key, value)
    }
    if (!headers.has('Content-Security-Policy')) {
      headers.set(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://challenges.cloudflare.com",
          "frame-src https://challenges.cloudflare.com",
          "frame-ancestors 'self' https://admin.studiostonehewer.co.uk",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      )
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    })
  },
}
