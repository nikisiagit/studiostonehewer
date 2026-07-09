module.exports = async function() {
  // TODO: Replace with your actual WordPress REST API endpoint for Global Settings.
  // For example: "https://admin.studiostonehewer.com/wp-json/wp/v2/settings"
  // Note: Standard WP REST API doesn't expose custom global settings by default. 
  // You can use an options page in ACF and a plugin like "ACF to REST API" 
  // to fetch global settings like logos and nav links.
  
  // Dummy data representing the WordPress settings payload
  return {
    site_title: "Studio Stonehewer",
    site_description: "Interior design rooted in curated and expressive moments to tell the stories of your home.",
    site_image: "/assets/images/oud-west-bedroom-pink.jpg",
    nav_logo: "https://res.cloudinary.com/davgu5v34/image/upload/v1782675783/stonehewer-logo-latest_s8skwe.svg",
    nav_links: [
      { label: "PROJECTS", url: "/projects/" },
      { label: "STUDIO", url: "/#studio" },
      { label: "ABOUT", url: "/#about" },
      { label: "CONTACT", url: "/#contact" }
    ]
  };
};
