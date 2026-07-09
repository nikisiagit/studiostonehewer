// Fetch data from WordPress REST API
// If your host supports Node 18+, native fetch is available.

module.exports = async function() {
  // TODO: Replace this URL with your actual WordPress REST API endpoint.
  // If you are using a Custom Post Type for "Projects", the URL would look like:
  // "https://your-wordpress-site.com/wp-json/wp/v2/projects"
  // If you are using standard posts, it would be:
  // "https://your-wordpress-site.com/wp-json/wp/v2/posts?categories=X"
  
  const WP_API_URL = "https://demo.wp-api.org/wp-json/wp/v2/posts?_embed"; 
  
  try {
    console.log(`Fetching projects from ${WP_API_URL}`);
    
    /* 
    // Uncomment this block when you have a real WordPress URL!
    const response = await fetch(WP_API_URL);
    if (!response.ok) {
      throw new Error(`WordPress API returned ${response.status}`);
    }
    const data = await response.json();
    
    // Map the WordPress data to match the structure Eleventy expects 
    // (the same structure Decap CMS provided).
    // Note: You will need the ACF plugin in WordPress if you want these exact custom fields.
    return data.map(post => {
      return {
        title: post.title.rendered,
        slug: post.slug,
        category: post.acf?.category || "Category",
        tag: post.acf?.tag || "Tag",
        year: post.acf?.year || "2024",
        description: post.acf?.description || "",
        featured_image: post.acf?.featured_image || "https://placeholder.com/image.jpg",
        intro_text_1: post.acf?.intro_text_1 || "",
        intro_text_2: post.acf?.intro_text_2 || "",
        gallery: post.acf?.gallery || []
      };
    });
    */

    // For now, we return dummy data so the site still builds while you set up WordPress.
    return [
      {
        title: "WordPress Demo Project",
        slug: "wp-demo-project",
        category: "RESIDENTIAL",
        tag: "FULL SERVICE",
        year: "2024",
        description: "This project is a placeholder until you connect your real WordPress URL.",
        featured_image: "https://res.cloudinary.com/sbnrjtk3/image/upload/v1782722914/IMG_6559_t4elwt.jpg",
        intro_text_1: "This text is coming from the wp_projects.js data file.",
        intro_text_2: "Once you set up Advanced Custom Fields in WordPress, your real text will appear here.",
        gallery: [
          {
            image: "https://res.cloudinary.com/sbnrjtk3/image/upload/v1782722914/IMG_7196_ufywm9.jpg",
            size: "regular"
          }
        ]
      }
    ];

  } catch (err) {
    console.error("Failed fetching WordPress data:", err);
    return [];
  }
};
