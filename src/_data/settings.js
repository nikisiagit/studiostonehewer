const { fetchJson, sanitizeHref, toPublicMediaUrl } = require('./fetchUtils');

module.exports = async function () {
  const BASE_URL = process.env.PAYLOAD_API_URL || 'http://127.0.0.1:3000';
  const API_URL = `${BASE_URL}/api/globals/site-settings`;

  const rawNavLinks = `PROJECTS | /projects/\nSTUDIO | /#studio\nABOUT | /#about\nCONTACT | /#contact`;

  let settings = {
    site_title: 'Studio Stonehewer',
    site_description:
      'Interior design rooted in curated and expressive moments to tell the stories of your home.',
    nav_links: rawNavLinks
      .split('\n')
      .filter((l) => l.trim())
      .map((line) => {
        const [label, url] = line.split('|').map((s) => s.trim());
        return { label, url: sanitizeHref(url, '/') };
      }),
    nav_logo: '/images/hero-logo.png',
  };

  const data = await fetchJson(API_URL, 'Payload Settings API');
  if (data && data.site_title) {
    let parsedNavLinks = settings.nav_links;
    if (data.nav_links) {
      parsedNavLinks = data.nav_links
        .split('\n')
        .filter((l) => l.trim())
        .map((line) => {
          const [label, url] = line.split('|').map((s) => s.trim());
          return { label, url: sanitizeHref(url, '/') };
        });
    }
    let navLogoUrl = settings.nav_logo;
    if (data.nav_logo && data.nav_logo.url) {
      const raw = data.nav_logo.url.startsWith('http')
        ? data.nav_logo.url
        : `${BASE_URL}${data.nav_logo.url}`;
      navLogoUrl = toPublicMediaUrl(raw);
    }

    settings = {
      site_title: data.site_title || settings.site_title,
      site_description: data.site_description || settings.site_description,
      nav_links: parsedNavLinks,
      nav_logo: navLogoUrl,
    };
  }

  return settings;
};
