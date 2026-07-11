module.exports = async function() {
  const API_URL = "http://127.0.0.1:3000/api/globals/site-settings";
  
  // Format: LABEL | URL
  const rawNavLinks = `PROJECTS | /projects/\nSTUDIO | /#studio\nABOUT | /#about\nCONTACT | /#contact`;

  let settings = {
    siteTitle: "Studio Stonehewer",
    siteDescription: "Interior design rooted in curated and expressive moments to tell the stories of your home.",
    navLinks: rawNavLinks.split('\n').filter(l => l.trim()).map(line => {
      const [label, url] = line.split('|').map(s => s.trim());
      return { label, url };
    })
  };

  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const data = await res.json();
      if (data && data.site_title) {
        let parsedNavLinks = settings.navLinks;
        if (data.nav_links) {
          parsedNavLinks = data.nav_links.split('\n').filter(l => l.trim()).map(line => {
            const [label, url] = line.split('|').map(s => s.trim());
            return { label, url };
          });
        }
        
        settings = {
          siteTitle: data.site_title || settings.siteTitle,
          siteDescription: data.site_description || settings.siteDescription,
          navLinks: parsedNavLinks
        };
      }
    }
  } catch (e) {
    console.log("Could not connect to Payload Settings API. Using dummy data.");
  }

  return settings;
};
