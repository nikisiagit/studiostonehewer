/**
 * Shared helpers for Eleventy data files that call the Payload API.
 */

function isStrictPayload() {
  return (
    process.env.CI === 'true' ||
    process.env.STRICT_PAYLOAD === '1' ||
    process.env.STRICT_PAYLOAD === 'true'
  );
}

/**
 * Public media host (R2 custom domain). When set, rewrites Payload media
 * URLs off the admin worker onto the CDN edge.
 * Example: https://media.studiostonehewer.co.uk
 */
function mediaPublicBase() {
  const base = (process.env.MEDIA_PUBLIC_URL || 'https://media.studiostonehewer.co.uk').replace(
    /\/$/,
    '',
  );
  return base;
}

function isLoopbackHost(hostname) {
  if (!hostname) return false;
  const h = String(hostname).toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]';
}

/**
 * Rewrite Payload media file URLs to the public R2 custom domain when possible.
 * /api/media/file/<filename> → https://media…/<filename>
 *
 * Also strips loopback hosts (localhost / 127.0.0.1) so production HTML never
 * triggers browser Local Network Access prompts.
 */
function toPublicMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (process.env.DISABLE_MEDIA_PUBLIC_URL === '1') return url;

  const base = mediaPublicBase();

  // Absolute Payload media URL (any host, including localhost during local builds)
  const absMatch = url.match(/^https?:\/\/[^/]+\/api\/media\/file\/(.+)$/i);
  if (absMatch) return `${base}/${absMatch[1]}`;

  // Relative Payload media path
  const relMatch = url.match(/^\/api\/media\/file\/(.+)$/i);
  if (relMatch) return `${base}/${relMatch[1]}`;

  // Loopback absolute URL → path only (never ship http://127.0.0.1… to browsers)
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (isLoopbackHost(parsed.hostname)) {
        return `${parsed.pathname}${parsed.search}` || '/';
      }
    } catch {
      /* keep original */
    }
  }

  return url;
}

/**
 * Resolve a CMS media field URL to something safe for the public static site.
 *
 * - Payload /api/media/file/* → public R2 host
 * - Site-static paths (/assets/..., /images/...) stay site-relative (never prefixed with CMS base)
 * - Other relative CMS paths get apiBase, then public rewrite
 * - Never returns a loopback host
 */
function resolveMediaUrl(url, apiBase = '') {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return toPublicMediaUrl(trimmed);
  }

  // Static site assets — must not be prefixed with the CMS origin
  if (
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('assets/') ||
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('images/')
  ) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  if (trimmed.startsWith('/api/media/file/')) {
    return toPublicMediaUrl(trimmed);
  }

  const base = String(apiBase || '').replace(/\/$/, '');

  if (trimmed.startsWith('/')) {
    if (base) return toPublicMediaUrl(`${base}${trimmed}`);
    return toPublicMediaUrl(trimmed);
  }

  if (base) return toPublicMediaUrl(`${base}/${trimmed}`);
  return toPublicMediaUrl(`/${trimmed}`);
}

/**
 * Fetch JSON with a timeout. In CI / STRICT_PAYLOAD mode, failures throw
 * so we never deploy the site with placeholder/dummy CMS content.
 */
async function fetchJson(url, label) {
  const timeoutMs = Number(process.env.PAYLOAD_FETCH_TIMEOUT_MS) || 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const err = new Error(`${label} failed: HTTP ${res.status} for ${url}`);
      if (isStrictPayload()) throw err;
      console.warn(err.message);
      return null;
    }
    return await res.json();
  } catch (e) {
    if (isStrictPayload()) {
      throw new Error(
        `${label} unreachable (${url}). Refusing to build with fallback data. ${e.message || e}`,
      );
    }
    console.warn(`${label}: ${e.message || e}. Using fallback data.`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Only allow relative paths or http(s) URLs — blocks javascript:/data: etc.
 */
function sanitizeHref(url, fallback = '#') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return fallback;
}

module.exports = {
  isStrictPayload,
  fetchJson,
  sanitizeHref,
  mediaPublicBase,
  toPublicMediaUrl,
  resolveMediaUrl,
  isLoopbackHost,
};
