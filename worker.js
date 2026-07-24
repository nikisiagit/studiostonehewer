const ALLOWED_ORIGINS = new Set([
  'https://studiostonehewer.co.uk',
  'https://www.studiostonehewer.co.uk',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
])

const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
  maxPerHour: 5,
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
  // Practical RFC-ish check; rejects newlines and header injection attempts
  if (typeof email !== 'string') return false
  if (email.length > CONTACT_LIMITS.email) return false
  if (/[\r\n\0]/.test(email)) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin')
  // Same-origin navigations / some clients may omit Origin
  if (!origin) return true
  if (ALLOWED_ORIGINS.has(origin)) return true
  // Preview / pages.dev deploys if ever used
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

async function isRateLimited(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const cache = caches.default
  const key = new Request(`https://rate-limit.internal/contact/${encodeURIComponent(ip)}`)
  const existing = await cache.match(key)
  let count = 0
  if (existing) {
    count = Number.parseInt(await existing.text(), 10) || 0
  }
  if (count >= CONTACT_LIMITS.maxPerHour) {
    return true
  }
  await cache.put(
    key,
    new Response(String(count + 1), {
      headers: { 'Cache-Control': 'max-age=3600' },
    }),
  )
  return false
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Contact Form Endpoint
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        if (!isAllowedOrigin(request)) {
          return jsonResponse({ error: 'Forbidden' }, 403)
        }

        if (await isRateLimited(request)) {
          return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429)
        }

        let name, email, message, honeypot
        const contentType = request.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
          const body = await request.json()
          name = body.name
          email = body.email
          message = body.message
          honeypot = body.website || body.company
        } else {
          const formData = await request.formData()
          name = formData.get('name')
          email = formData.get('email')
          message = formData.get('message')
          honeypot = formData.get('website') || formData.get('company')
        }

        // Honeypot: bots fill hidden fields — pretend success
        if (honeypot) {
          return jsonResponse({ success: true })
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
    // Basic CSP for static site (allows Google Fonts + self)
    if (!headers.has('Content-Security-Policy')) {
      headers.set(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self'",
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
