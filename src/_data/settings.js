module.exports = async function() {
  // TODO: Replace with your actual WordPress REST API endpoint for Global Settings.
  
  // Simulated raw string from an ACF Text Area (for free tier workaround)
  // Format: LABEL | URL
  const rawNavLinks = `PROJECTS | /projects/
STUDIO | /#studio
ABOUT | /#about
CONTACT | /#contact`;

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

  // Dummy data representing the WordPress settings payload
  return {
    site_title: "Studio Stonehewer",
    site_description: "Interior design rooted in curated and expressive moments to tell the stories of your home.",
    site_image: "/assets/images/oud-west-bedroom-pink.jpg",
    nav_logo: "https://res.cloudinary.com/davgu5v34/image/upload/v1782675783/stonehewer-logo-latest_s8skwe.svg",
    nav_links: parseNavLinks(rawNavLinks)
  };
};
