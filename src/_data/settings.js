module.exports = async function() {
  const API_URL = "https://admin.nikitaovcinnikovs.com/wp-json/wp/v2/pages?slug=site-settings";
  
  // Format: LABEL | URL
  const rawNavLinks = `PROJECTS | /projects/\nSTUDIO | /#studio\nABOUT | /#about\nCONTACT | /#contact`;

  // Helper to parse the nav links text area
  const parseNavLinks = (text) => {
    if (!text) return [];
    return text.split('\n').map(line => {
      const parts = line.split('|');
      return {
        label: parts[0] ? parts[0].trim() : '',
        url: parts[1] ? parts[1].trim() : '#'
      };
    }).filter(link => link.label.length > 0);
  };

  const fallbackData = {
    site_title: "Studio Stonehewer",
    site_description: "Interior design rooted in curated and expressive moments to tell the stories of your home.",
    site_image: "/assets/images/oud-west-bedroom-pink.jpg",
    nav_logo: "https://res.cloudinary.com/davgu5v34/image/upload/v1782675783/stonehewer-logo-latest_s8skwe.svg",
    nav_links: parseNavLinks(rawNavLinks)
  };

  let liveSettings = {};
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (data && data.length > 0 && data[0].acf) {
      liveSettings = data[0].acf;
    }
  } catch (err) {
    console.warn("[settings] Failed to fetch live site settings", err);
  }

  // Merge live data over fallback data
  const merged = { ...fallbackData };
  for (const key in liveSettings) {
    if (liveSettings[key] !== "" && liveSettings[key] !== null && fallbackData[key] !== undefined) {
      merged[key] = liveSettings[key];
    }
  }

  // If live data has nav links, parse them, otherwise it uses the fallback parsed links
  if (liveSettings.nav_links) {
    merged.nav_links = parseNavLinks(liveSettings.nav_links);
  } else {
    merged.nav_links = fallbackData.nav_links;
  }

  return merged;
};
