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
};
